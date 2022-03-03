"""
Helper functions
"""
from rest_framework.exceptions import ParseError, NotAcceptable, APIException, NotFound
from django.contrib.auth.models import User, Group
from django.core.exceptions import ObjectDoesNotExist
from django.db import transaction
from django.db.models import Q
from django.db.utils import IntegrityError
from django.forms.models import model_to_dict
from heros.configuration.models import ConfigDocument
from heros.configuration.utils import unpack_full_code

OBJECT_DOCUMENT_TYPE = 'object'
METHOD_DOCUMENT_TYPE = 'method'


def create_config_document_validator(document_type, data_dict, overwrite):
    """
    Create config document validator
    """
    data_dict_code = _validate_code_field(data_dict)

    try:
        config_document = ConfigDocument.objects.get(
            document_type=document_type, code=data_dict_code)
        if not overwrite:
            raise NotAcceptable(
                "There's already a ConfigDocument with code %s" % data_dict_code)
    except ObjectDoesNotExist:
        # It's ok, It can not exists a ConfigDocument with the same code
        config_document = ConfigDocument()
        config_document.document_type = document_type
        config_document.code = data_dict_code
        if "id" in data_dict:
            del data_dict["id"]

    return config_document


def update_config_document_validator(document_type, data_dict, document_id):
    """
    Update config document validator
    """
    data_dict_code = _validate_code_field(data_dict)
    config_document = _validate_and_get_config_document_by_id(
        document_type, document_id)

    try:
        _ = ConfigDocument.objects.exclude(
            pk=config_document.id).get(document_type=document_type, code=data_dict_code)
        raise NotAcceptable(
            "There's already a ConfigDocument with code %s" % data_dict_code)
    except ObjectDoesNotExist:
        # It's ok, It can not exists a ConfigDocument with the same code
        pass

    config_document.code = data_dict_code
    if "id" in data_dict:
        del data_dict["id"]
    return config_document


def delete_config_document_validator(document_id):
    """
    Pending doc
    """
    try:
        ret = ConfigDocument.objects.get(id=document_id)
        return ret
    except ObjectDoesNotExist:
        raise NotFound(
            'ConfigDocument with (id %s) does not exists' % document_id)


def create_config_document(document_type, data_dict, overwrite=None):
    """
    Create config document
    """
    config_document = create_config_document_validator(
        document_type, data_dict, overwrite)
    config_document.data = data_dict
    config_document_saved = _save_config_document_and_related_tables(
        config_document)
    return convert_model_to_api(config_document_saved)


def update_config_document(document_type, data_dict, document_id):
    """
    Pending doc
    """
    config_document = update_config_document_validator(
        document_type, data_dict, document_id)
    config_document.data = data_dict
    config_document_saved = _save_config_document_and_related_tables(
        config_document)
    result = convert_model_to_api(config_document_saved)
    return result


def delete_config_document(document_id):
    """
    Pending doc
    """
    config_document = delete_config_document_validator(document_id)
    ret = config_document.delete()
    return ret


def convert_model_to_api(config_document):
    """
    Pending doc
    """
    ret = model_to_dict(config_document)
    ret["created_at"] = config_document.created_at
    ret["modified_at"] = config_document.modified_at
    return ret


def _validate_code_field(data_dict):
    """
    Pending doc
    """
    code = data_dict.get("code", None)
    if not code:
        ParseError('Property code must be informed')

    return code


def _validate_and_get_config_document_by_id(document_type, document_id):
    """
    Pending doc
    """
    try:
        ret = ConfigDocument.objects.get(
            document_type=document_type, id=document_id)
        return ret
    except ObjectDoesNotExist:
        raise NotFound(
            'ConfigDocument with (document_type %s and id %s) does not exists' %
            (document_type, document_id))


def _save_config_document_and_related_tables(config_document):
    """
    Pending doc
    """
    try:
        with transaction.atomic():
            config_document.save()

    except IntegrityError as excetion:
        raise APIException(str(excetion))

    # Save database
    return config_document


def get_user_mail(user):
    user = User.objects.filter(username=user).first()
    return user and user.email


def get_type_properties(object_type,packages):
    properties = []
    if object_type.get("type") == 'object':
        try:
            package_code, code = unpack_full_code(object_type.get("object_code"))
            document = ConfigDocument.objects.filter(
                document_type=OBJECT_DOCUMENT_TYPE,
                code=code,
                package_version__package__code=package_code,
                package_version_id__in=packages
            ).first()
            if document and document.data:
                properties = document.data.get("properties")
        except ConfigDocument.DoesNotExist:
            return []
    return properties


def get_type_methods(object_type, packages, language):
    query = ConfigDocument.objects.filter(
        document_type=METHOD_DOCUMENT_TYPE, 
        data__language=language, 
        package_version_id__in=packages)
    if object_type.get("type") == 'object':
        query = query.filter(
            (Q(data__parent_type__type=object_type.get("type")) &
             Q(data__parent_type__object_code=object_type.get("object_code"))) |
            Q(data__parent_type__type="$any") |
            Q(data__parent_type__type="$anyObject")
        )
    elif object_type.get("type") == 'array':
        query = query.filter(
            Q(data__parent_type__type=object_type.get("type")) |
            Q(data__parent_type__type="$any")
        )
    else:
        query = query.filter(
            Q(data__parent_type__type=object_type.get("type")) |
            Q(data__parent_type__type="$any") |
            Q(data__parent_type__type="$anyPrimitive")
        )
    print(query.query)
    return map(lambda item: item.data, query)


def get_type_members(object_type, language, packages, exclude_properties=False, exclude_methods=False):
    properties = []
    methods = []
    if not exclude_properties:
        properties = get_type_properties(object_type,packages)
    if not exclude_methods:
        methods = get_type_methods(object_type, packages, language)

    return {"properties": properties, "methods": methods}


