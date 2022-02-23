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


def get_object_properties(type):
    properties = []
    if type.get("type") == 'object':
        try:
            document = ConfigDocument.objects.get(
                document_type=OBJECT_DOCUMENT_TYPE,
                code=type.get("objectCode"))
            if document and document.data:
                properties = document.data.get("properties")
        except ConfigDocument.DoesNotExist:
            return []
    return properties


def get_object_methods(type, language):
    query = ConfigDocument.objects.filter(
        document_type=METHOD_DOCUMENT_TYPE, data__language=language)
    if type.get("type") == 'object':
        query = query.filter(
            (Q(data__parentType__type=type.get("type")) &
             Q(data__parentType__objectCode=type.get("objectCode"))) |
            Q(data__parentType__type="$any") |
            Q(data__parentType__type="$anyObject")
        )
    elif type.get("type") == 'array':
        query = query.filter(
            Q(data__parentType__type=type.get("type")) |
            Q(data__parentType__type="$any")
        )
    else:
        query = query.filter(
            Q(data__parentType__type=type.get("type")) |
            Q(data__parentType__type="$any") |
            Q(data__parentType__type="$anyPrimitive")
        )
    print(query.query)
    return map(lambda item: item.data, query)


def get_object_members(type, language):
    properties = get_object_properties(type)
    methods = get_object_methods(type, language)

    return {"properties": properties, "methods": methods}


