from heros.configuration.models import ConfigDocument, Package, PackageVersion
from heros.configuration.serializers import ConfigDocumentSerializer
from django.db import transaction
from django.conf import settings
from git import Repo
from os import path
import os
import shutil
import json

from heros.configuration.utils import get_directories

document_types = ['context','object','method']
repo_base_path = path.join(".","repos")
class PackageRepository:
    def __init__(self):
        self.repo_path = path.join(repo_base_path, "package-repository")
        self.packages_file = "darvel_packages.json"
        self.packages_path = path.join(self.repo_path,self.packages_file)
        if os.path.isdir(self.repo_path):
            shutil.rmtree(self.repo_path)
        self.repo = Repo.clone_from(settings.GIT_REPOSITORY,self.repo_path)
    def get_packages(self):
        with open(self.packages_path, "r") as read_file :
            packages = json.load(read_file)
        return packages
        
        
class GitPackage:
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
    def set_version(self, version):
        self.version = version

    def ensure_version(self):
        if not self.version:
            raise Exception("Version required")

    def update_remote_status(self):
        for remote in self.repo.remote().refs:
            if remote.remote_head != 'HEAD':
                existing_version = self.package.versions.filter(version=remote.remote_head).first()
                if existing_version:
                    existing_version.remote_commit = remote.commit.hexsha
                    existing_version.save()


    def get_branches(self):
        branches = []
        for remote in self.repo.remote().refs:
            if remote.remote_head != 'HEAD':
                branches.append(remote.remote_head)
        return branches

    def get_available_branches(self):
        current_branches = list(map(lambda version: version.version, self.package.versions.all()))
        available_branches = []
        remote_branches = self.get_branches()
        for branch in remote_branches:
            if not branch in current_branches:
                available_branches.append(branch)
        return available_branches

    def create_version_branch(self,from_version):
        self.ensure_version()
        self.repo.git.checkout(from_version)
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
            data.pop("id",None)
            data.pop("full_code",None)
            data.pop("package_version",None)
            os.makedirs(os.path.dirname(document_path), exist_ok=True)
            with open(document_path, "w") as outfile:
                json.dump(data, outfile,indent=4)
            self.repo.index.add(document_git_path)

    def import_remote_package(self):
        self.ensure_version()
        self.checkout_version()
        with open(self.dependency_path, "r") as read_file :
            dependencies = json.load(read_file)
        self.version.dependencies.all().delete()
        for package,version in dependencies.items():
            existing_version = PackageVersion.objects.filter(package__code=package, version=version).first()
            if not existing_version:
                raise Exception("Dependency version doesn't exists locally")
            self.version.dependencies.add(existing_version)
        with transaction.atomic():
            self.version.config_documents.all().delete()
            if path.exists(self.docs_path):
                directories = get_directories(self.docs_path)
                for directory in directories:
                    files = os.listdir(directory)
                    for file in files:
                        if file.endswith('.json'):
                            file_path = os.path.join(directory,file)
                            with open(file_path, "r") as read_file:
                                document_data = json.load(read_file)
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


