# Generated by Django 4.0.2 on 2022-03-07 17:08

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('configuration', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='configdocument',
            name='package_version',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='config_documents', to='configuration.packageversion'),
        ),
    ]