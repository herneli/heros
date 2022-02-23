from django.db import models

# Create your models here.
class Document(models.Model):
    document_type = models.CharField(max_length=30)
    code = models.CharField(max_length=50)
    data = models.JSONField()
    deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True,blank=True)

    def __str__(self):
        return self.code
    class Meta:
        db_table="document"
        constraints = [
            models.UniqueConstraint(fields= ['document_type','code'], name="unique_document_type_code"),
        ]    

class DocumentRelation(models.Model):
    document_base = models.ForeignKey(Document, on_delete=models.CASCADE,related_name="relations_as_base") 
    document_related = models.ForeignKey(Document, on_delete=models.CASCADE, related_name="relations_as_related")
    relation = models.CharField(max_length=30)

    def __str__(self):
        return (
            self.document_base.document_type + "-" + self.document_base.code + "/" + 
            self.document_related.document_type + "-" + self.document_related.code + "/"
            + self.relation
        )


    class Meta:
        db_table = "document_relation"