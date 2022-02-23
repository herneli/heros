from django.db import models
from django.db import models
# Create your models here.
class Package(models.Model):
    code = models.CharField(
        max_length=50, unique=True)
    name = models.CharField(
        max_length=50)
    remote = models.CharField(null=True, blank=True,
        max_length=255)

    def __str__(self):
        return "{}".format(self.code)

    class Meta:
        db_table = 'package'

class PackageVersion(models.Model):
    package = models.ForeignKey(Package,on_delete=models.CASCADE, related_name="versions")
    version = models.CharField(
        max_length=50)
    remote_commit = models.CharField(null=True, blank=True,
        max_length=255)
    local_commit = models.CharField(null=True, blank=True,
        max_length=255)
    dependencies = models.ManyToManyField("PackageVersion",blank=True)
    modified = models.BooleanField(default=False)

    def __str__(self):
        return "{}-{}".format(self.package.code, self.version)

    class Meta:
        db_table = 'package_version'
        constraints = [
            models.UniqueConstraint(fields= ['package_id','version'], name="package_version_unique_code_version"),
        ]           

class ConfigInfo(models.Model):
    """
    Config Info
    """
    document_type = models.CharField(
        max_length=20, db_index=True, unique=True)
    data = models.TextField()

    def __str__(self):
        return "{}".format(self.document_type)

    class Meta:
        db_table = 'config_info'


class ConfigDocument(models.Model):
    """
    Config document
    """
    document_type = models.CharField(max_length=20)
    code = models.CharField(max_length=200)
    package_version = models.ForeignKey("PackageVersion",on_delete=models.CASCADE, related_name="config_documents")
    data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    @property
    def full_code(self):
        return self.package_version.package.code + "." + self.code

    def __str__(self):
        return "{}_{}".format(self.document_type, self.code)

    class Meta:
        db_table = u'config_document'
        constraints = [
            models.UniqueConstraint(fields= ["package_version_id","document_type", "code"], name="config_document_unique_key"),
        ]   

