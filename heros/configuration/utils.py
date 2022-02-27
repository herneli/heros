import os

def get_directories(dir_path):
    directories = []
    for dir_item in os.listdir(dir_path):
        dir_item_path = os.path.join(dir_path, dir_item)
        if os.path.isdir(dir_item_path):
            directories.append(dir_item_path)
            directories.extend(get_directories(dir_item_path))
    return directories