# Generated by Django 4.0.2 on 2022-02-22 15:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_document_deleted_document_deleted_at'),
    ]

    operations = [
        migrations.AlterField(
            model_name='document',
            name='deleted_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]