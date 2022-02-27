from heros.configuration.models import ConfigDocument, Package, PackageVersion
from heros.configuration.serializers import ConfigDocumentSerializer
from django.db import transaction
from git import Repo
from os import path
import os
import shutil
import json

from heros.configuration.utils import get_directories

document_types = ['context','object','method']
repo_base_path = path.join(".","repos")

class PackageRepository:
    def __init__(self, package, version=None):
        if not package.remote:
            raise Exception("Remote repository not updated in package")
        self.package = package
        self.docs_folder = "docs"
        self.dependencies_file = "dependencies.json"
        self.repo_path = path.join(repo_base_path, package.code)
        self.docs_path = path.join(self.repo_path , self.docs_folder)
        self.dependency_path = path.join(self.repo_path,self.dependencies_file)
        if os.path.isdir(self.repo_path):
            shutil.rmtree(self.repo_path)
        self.repo = Repo.clone_from(package.remote,self.repo_path)
        self.version = version

    def ensure_version(self):
        if not self.version:
            raise Exception("Version required")

    def update_remote_status(self):
        for remote in self.repo.remote().refs:
            if remote.remote_head != 'HEAD':
                version = self.package.versions.filter(version=remote.remote_head).first()
                if version:
                    version.remote_commit = remote.commit.hexsha
                    version.save()

    def get_available_branches(self):
        current_branches = list(map(lambda version: version.version, self.package.versions))
        available_branches = []
        for remote in self.repo.remote().refs:
            if remote.remote_head != 'HEAD':
                if not remote.remote_head in current_branches:
                    available_branches.append(remote.remote_head)
        return available_branches

    def create_version_branch(self,from_version):
        self.ensure_version()
        self.repo.git.branch(self.version.version,c=from_version)

    def checkout_version(self,from_version=None):
        self.ensure_version()
        if self.version.remote_commit == 'initial':
            self.repo.git.checkout('--orphan',self.version.version)
        else: 
            self.repo.git.checkout(self.version.version)

    def write_documents_to_repo(self):
        self.ensure_version()
        if os.path.isdir(self.docs_path):
            # shutil.rmtree(docs_path)
            self.repo.index.remove(items=[self.docs_folder],working_tree=True,r=True)

        dependencies = {}
        for dependency in self.version.dependencies.all():
            dependencies[dependency.package.code] = dependency.version
        
        with open(self.dependency_path, "w") as outfile:
            json.dump(dependencies, outfile,indent=4)
        self.repo.index.add(self.dependencies_file)
        for document in self.version.config_documents.all():
            document_git_path = '/'.join([
                self.docs_folder, 
                document.document_type, 
                document.code + ".json"])

            document_path = path.join(
                self.docs_path ,
                document.document_type, 
                document.code + ".json")

            data = ConfigDocumentSerializer(document).data
            os.makedirs(os.path.dirname(document_path), exist_ok=True)
            with open(document_path, "w") as outfile:
                json.dump(data, outfile,indent=4)
            self.repo.index.add(document_git_path)

    def import_remote_package(self):
        self.ensure_version()
        self.checkout_version()
        with transaction.atomic():
            self.version.config_documents.all().delete()
            directories = get_directories(self.docs_path)
            for directory in directories:
                files = os.listdir(directory)
                for file in files:
                    if file.endswith('.json'):
                        file_path = os.path.join(directory,file)
                        with open(file_path, "r") as read_file:
                            document_data = json.load(read_file)
                        document_data.pop("id")
                        document_data.pop("id",None)
                        document_data.pop("full_code",None)
                        document_data.pop("created_at",None)
                        document_data.pop("modified_at",None)
                        document_data["package_version"] = self.version
                        ConfigDocument.objects.create(**document_data)
            self.version.remote_commit = self.repo.head.commit.hexsha
            self.version.local_commit = self.repo.head.commit.hexsha
            self.version.save()

    def commit_and_push(self, message):
        self.ensure_version()
        if self.repo.is_dirty():
            commit = self.repo.index.commit(message)
            self.repo.git.push('origin', self.version.version)
            self.version.local_commit = commit.hexsha
            self.version.remote_commit = commit.hexsha
            self.version.save()

    def get_repo(self):
        return self.repo