import os
from kmrl_ocr.ocr import extract_blocks
from kmrl_ocr.utils import pdf_to_images, extract_text_from_pdf
from kmrl_ocr.exporter import save_results

def process_document(doc_path: str, output_path="output.json"):
    pages = []

    if doc_path.endswith(".pdf"):
        
        digital_pages = extract_text_from_pdf(doc_path)

        if any(p["text"] for p in digital_pages): 
            print("[INFO] Digital PDF detected → extracting text directly")
            for p in digital_pages:
                pages.append({
                    "page": p["page"],
                    "file": doc_path,
                    "blocks": [{
                        "text": p["text"],
                        "lang": "en",  
                        "confidence": 100,
                        "bbox": None
                    }]
                })
        else:
            print("[INFO] Scanned PDF detected → running OCR")
            image_paths = pdf_to_images(doc_path)
            for idx, img in enumerate(image_paths):
                blocks = extract_blocks(img)
                pages.append({
                    "page": idx + 1,
                    "file": img,
                    "blocks": blocks
                })
    else:
        blocks = extract_blocks(doc_path)
        pages.append({"page": 1, "file": doc_path, "blocks": blocks})

    save_results(pages, output_path)
    return pages

if __name__ == "__main__":
    dataset_dir = "data/"
    os.makedirs("output", exist_ok=True)

    for file in os.listdir(dataset_dir):
        doc_path = os.path.join(dataset_dir, file)
        out_file = os.path.join("output", f"{os.path.splitext(file)[0]}.json")
        process_document(doc_path, out_file)

