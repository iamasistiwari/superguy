from transformers import DistilBertForSequenceClassification, DistilBertTokenizer
import torch

# Load model and tokenizer
model = DistilBertForSequenceClassification.from_pretrained("./email_classifier_model")
tokenizer = DistilBertTokenizer.from_pretrained("./email_classifier_model")


# Put model in eval mode
model.eval()

# Example email text you want to classify
email_text = "We would love to collaborate with you for a sponsorship."

# Tokenize the input
inputs = tokenizer(email_text, return_tensors="pt", truncation=True, padding=True)

# Run the model
with torch.no_grad():
    outputs = model(**inputs)
    logits = outputs.logits

# Get the predicted label
predicted_class_id = logits.argmax().item()
print(f"Predicted class id: {predicted_class_id}")
