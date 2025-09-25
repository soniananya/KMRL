import os, json
from typing import List, Dict, Any
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_chroma import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.retrievers import BM25Retriever
from langchain.retrievers import EnsembleRetriever

GEMINI_MODEL = "gemini-2.0-flash"
PERSIST_DIR = "./chroma_kmrl"

emb = HuggingFaceEmbeddings(model_name="intfloat/multilingual-e5-base")

# Create/load vector store
vectorstore = Chroma(
    collection_name="kmrl_docs",
    embedding_function=emb,
    persist_directory=PERSIST_DIR,
)

# -------- Structured output models --------
class DocCat(BaseModel):
    domain: str = Field(..., description="One of [Electrical, Mechanical, Operations, Finance, Accounts, Admin]")
    summary: str

class RagOut(BaseModel):
    summary: str
    key_points: List[str] = []
    deadlines: List[str] = []
    tags: List[str] = []
    citations: List[Dict[str, Any]] = []

# -------- Categorize + summarize single doc --------
def categorize_and_summarize(doc_text: str) -> Dict[str, str]:
    llm = ChatGoogleGenerativeAI(model=GEMINI_MODEL, temperature=0)
    structured = llm.with_structured_output(DocCat)  # enforce JSON
    prompt = ChatPromptTemplate.from_messages([
        ("system",
         "You are a document classifier and summarizer for metro operations. "
         "Classify the document into one domain: [Electrical, Mechanical, Operations, Finance, Accounts, Admin]. "
         "Then provide a short 2–3 line factual summary."),
        ("human", "Document:\n{doc}")
    ])
    chain = prompt | structured
    result = chain.invoke({"doc": doc_text})
    return result.dict()

# -------- Indexing helper --------
def index_documents(texts: List[str], metadatas: List[Dict[str, Any]]):
    docs = []
    for t, m in zip(texts, metadatas):
        res = categorize_and_summarize(t)
        m = {**m, "domain": res.get("domain", "Uncategorized"), "doc_summary": res.get("summary", "")}
        docs.append(Document(page_content=t, metadata=m))
    vectorstore.add_documents(docs)
    vectorstore.persist()  # ensure durability
    return len(docs)

# -------- Build hybrid retriever --------
def build_hybrid_retriever(k_dense: int = 6, k_sparse: int = 6, weights=(0.6, 0.4)):
    store_dump = vectorstore.get(include=["documents", "metadatas"])
    all_docs = [Document(page_content=t, metadata=m) for t, m in zip(store_dump["documents"], store_dump["metadatas"])]
    bm25 = BM25Retriever.from_documents(all_docs, k=k_sparse)
    dense = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": k_dense})
    return EnsembleRetriever(retrievers=[dense, bm25], weights=list(weights))

# -------- RAG summarizer --------
def build_summarizer():
    llm = ChatGoogleGenerativeAI(model=GEMINI_MODEL, temperature=0.2)
    structured = llm.with_structured_output(RagOut)
    prompt = ChatPromptTemplate.from_messages([
        ("system",
         "Act as a compliance-safe summarizer for metro operations. Use only the provided context; if unsure, say so."),
        ("human",
         "Role: {role}\nQuery: {query}\nContext:\n{context}\nReturn JSON with fields: "
         "summary, key_points[], deadlines[], tags[], citations[].")
    ])
    return prompt | structured

def rag_answer(hybrid_retriever, query: str, role: str = "safety", k: int = 6):
    docs = hybrid_retriever.invoke(query)
    if not docs:
        return RagOut(summary="No relevant content found.").dict()
    context = "\n\n".join([d.page_content for d in docs[:k]])
    citations = [{"source": d.metadata.get("source", ""),
                  "domain": d.metadata.get("domain", ""),
                  "doc_summary": d.metadata.get("doc_summary", "")} for d in docs[:k]]
    chain = build_summarizer()
    out: RagOut = chain.invoke({"role": role, "query": query, "context": context})
    result = out.dict()
    result["citations"] = citations
    return result
