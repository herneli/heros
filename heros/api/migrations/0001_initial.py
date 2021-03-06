# Generated by Django 4.0.2 on 2022-02-13 12:13

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Document',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('document_type', models.CharField(max_length=30)),
                ('code', models.CharField(max_length=50)),
                ('data', models.JSONField()),
            ],
            options={
                'db_table': 'document',
            },
        ),
        migrations.CreateModel(
            name='DocumentRelation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('relation', models.CharField(max_length=30)),
                ('document_base', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='relations_as_base', to='api.document')),
                ('document_related', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='relations_as_related', to='api.document')),
            ],
            options={
                'db_table': 'document_relation',
            },
        ),
        migrations.AddConstraint(
            model_name='document',
            constraint=models.UniqueConstraint(fields=('document_type', 'code'), name='unique_document_type_code'),
        ),
    ]
