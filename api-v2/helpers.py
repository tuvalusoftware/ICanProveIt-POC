import pytesseract

def pretty_docs(docs):
    return f"\n{'-' * 100}\n".join([f"Document {i+1}:\n\n" + d.page_content for i, d in enumerate(docs)])

def image_to_text(image):
    return pytesseract.image_to_string(image)