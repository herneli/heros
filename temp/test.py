def event_save_order(order,current_user):
    ## kasjkd jsad
    pass

order = {
    "patient": {
        "name": "Jordi",
        "age": 46
    },
    "date": "2022-03-12",
    "tests": [{
        "code": "GLU"
    }]
} 

current_user = {
    "code": "hernaj34",
    "department": "DH",
    "permissions": ["add","delete"]
}
## Guardar petición en BBDD

## Acciones de usuario
event_save_order(order=order, current_user=current_user)

