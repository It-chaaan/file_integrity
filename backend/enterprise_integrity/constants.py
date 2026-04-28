DEFAULT_DOCUMENT_TYPES = [
    "Master Service Agreement (MSA)",
    "Non-Disclosure Agreement (NDA)",
    "Purchase Order (PO)",
    "Vendor Contract",
    "Employment Contract",
    "Board Resolution",
    "Financial Audit Report",
    "Compliance Certificate",
    "Insurance Policy",
    "Intellectual Property Agreement",
    "Shareholder Agreement",
    "Loan Agreement",
    "Data Processing Agreement (DPA)",
]

STATUS_VERIFIED = "verified"
STATUS_PENDING = "pending"
STATUS_FAILED = "failed"
STATUS_EXPIRED = "expired"

DOCUMENT_STATUS_CHOICES = [
    (STATUS_VERIFIED, "Verified"),
    (STATUS_PENDING, "Pending"),
    (STATUS_FAILED, "Failed"),
    (STATUS_EXPIRED, "Expired"),
]

VERIFY_STATUS_VERIFIED = "VERIFIED"
VERIFY_STATUS_NOT_FOUND = "NOT_FOUND"
VERIFY_STATUS_SIGNATURE_INVALID = "SIGNATURE_INVALID"
