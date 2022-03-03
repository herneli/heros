import os

from cv2 import split

def get_directories(dir_path):
    directories = []
    for dir_item in os.listdir(dir_path):
        dir_item_path = os.path.join(dir_path, dir_item)
        if os.path.isdir(dir_item_path):
            directories.append(dir_item_path)
            directories.extend(get_directories(dir_item_path))
    return directories


def unpack_full_code(object_code):
    package_code = None
    code = None
    parts = (object_code or "").split(".")
    if len(parts) > 0:
        if len(parts) == 1:
            code = parts[0]
        else:
            package_code = ".".join(parts[:-1])
            code = parts[-1]
    return package_code, code
