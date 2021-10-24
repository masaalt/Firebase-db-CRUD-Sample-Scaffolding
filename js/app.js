$(document).ready(function(){

    /*********************************************************
     ******* View Logic (show/remove rows in table) **********
     *********************************************************/

    // add new message to table
    var tableShowMessage = function (key, values) {
        var table = $('#table-messages');
        var created = (values.created ? moment(values.created).format('YYYY-MM-DD, HH:mm:ss') : '<em>no info</em>');
        var edited = (values.edited ? moment(values.edited).format('YYYY-MM-DD, HH:mm:ss') : '<em>not yet</em>');
        var newEntry = '<tr id="' + key + '"><td class="name">' + values.name + '</td><td class="mobile">' + values.mobile + '</td>'+ '</td><td class="address">' + values.address + '</td>'+ '</td><td class="ccPaymentMethod">' + values.ccPaymentMethod + '</td>'+ '</td><td class="order">' + values.order + '</td>'+ '</td><td class="price">' + values.price + '</td>' +
            '<td class="created">' + created + '</td><td class="created">' + edited + '</td>' +
            '<td class="table-col-action"><div class="btn-group">' +
            '<button class="btn btn-secondary button-edit">edit</button><button class="btn btn-secondary button-delete">delete</button>' +
            '</div></td></tr>';
        table.html(table.html() + newEntry);
    };

    // show message modification in table
    var tableModifyMessage = function(key, values) {
        $('#' + key + ' .name').text(values.name);
        $('#' + key + ' .mobile').text(values.mobile);
        $('#' + key + ' .address').text(values.address);
        $('#' + key + ' .ccPaymentMethod').text(values.ccPaymentMethod);
        $('#' + key + ' .order').text(values.order);
        $('#' + key + ' .price').text(values.price);
    };

    // remove a message from table
    var tableDeleteMessage = function (key) {
        $('#' + key).remove();
    };

    /*******************************************************
     ***** Firebase DB Logic (listen for changes) **********
     *******************************************************/

    // listen for new messages
    firebase.database().ref('orders').on('child_added', function(snapshot) {
        tableShowMessage(snapshot.key, snapshot.val());
    });

    // listen for modified messages
    firebase.database().ref('orders').on('child_changed', function(snapshot) {
        tableModifyMessage(snapshot.key, snapshot.val());
    });

    // listen for deleted messages
    firebase.database().ref('orders').on('child_removed', function(snapshot) {
        tableDeleteMessage(snapshot.key);
    });

    /********************************************************
     ****** Form Logic (add / remove messages) **************
     ********************************************************/

    // add new message
    $('#form-add').submit(function (event) {
        var name = $('#form-add-name');
        var mobile = $('#form-add-mobile');
        var address = $('#form-add-address');
        var ccPaymentMethod = $('#form-add-ccPaymentMethod');
        var order = $('#form-add-order');
        var price = $('#form-add-price');
        var button = $('#form-add-save');
        if(title.val().length === 0 || message.val().length === 0) {
            alert('Please enter a title and a message.');
            return false;
        }
        button.prop('disabled', true);
        // save new entry to database
        var newMessageKey = firebase.database().ref().child('orders').push({
            name: name.val().replace('<', '[').replace('>', ']'), // sanitize input: < > to [ ]
            mobile: mobile.val().replace('<', '[').replace('>', ']'), // sanitize input: < > to [ ]
            address: address.val().replace('<', '[').replace('>', ']'), // sanitize input: < > to [ ]
            ccPaymentMethod: ccPaymentMethod.val().replace('<', '[').replace('>', ']'), // sanitize input: < > to [ ]
            order: order.val().replace('<', '[').replace('>', ']'), // sanitize input: < > to [ ]
            price: price.val().replace('<', '[').replace('>', ']'), // sanitize input: < > to [ ]

            created: firebase.database.ServerValue.TIMESTAMP
        }, function(error) {
            if (error) {
                alert('The message could not be saved!');
            } else {
                name.val('');
                mobile.val('');
                address.val('');
                ccPaymentMethod.val('');
                order.val('');
                price.val('');

                button.prop('disabled', false);
                $('#modal-add-message').modal('hide');
            }
        });
        return false;
    });

    // edit message
    $('#form-edit').submit(function (event) {
        var name = $('#form-edit-name');
        var mobile = $('#form-edit-mobile');
        var address = $('#form-edit-address');
        var ccPaymentMethod = $('#form-edit-ccPaymentMethod');
        var order = $('#form-edit-order');
        var price = $('#form-edit-price');
        var key = $('#form-edit-key').val();
        var button = $('#form-edit-save');
        if(name.val().length === 0 || mobile.val().length === 0|| address.val().length === 0|| ccPaymentMethod.val().length === 0|| order.val().length === 0|| price.val().length === 0) {
            alert('Please enter a title and a message.');
            return false;
        }
        button.prop('disabled', true);
        // save changes to database
        var newMessageKey = firebase.database().ref().child('orders/' + key).set({
            name: name.val().replace('<', '[').replace('>', ']'), // sanitize input: < > to [ ]
            mobile: mobile.val().replace('<', '[').replace('>', ']'), // sanitize input: < > to [ ]
            address: address.val().replace('<', '[').replace('>', ']'), // sanitize input: < > to [ ]
            ccPaymentMethod: ccPaymentMethod.val().replace('<', '[').replace('>', ']'), // sanitize input: < > to [ ]
            order: order.val().replace('<', '[').replace('>', ']'), // sanitize input: < > to [ ]
            price: price.val().replace('<', '[').replace('>', ']'), // sanitize input: < > to [ ]

            edited: firebase.database.ServerValue.TIMESTAMP
        }, function(error) {
            if (error) {
                alert('The message could not be saved!');
            } else {
                name.val('');
                mobile.val('');
                address.val('');
                ccPaymentMethod.val('');
                order.val('');
                price.val('');
                button.prop('disabled', false);
                $('#modal-edit-message').modal('hide');
            }
        });
        return false;
    });

    // close add modal (abort)
    $('#form-add-abort').click(function() {
        $('#modal-add-message').modal('hide');
    });

    // close edit modal (abort)
    $('#form-edit-abort').click(function() {
        $('#modal-edit-message').modal('hide');
    });

    // button "edit" for message
    $(document).on('click', '.button-edit', function(event){
        var key = this.parentNode.parentNode.parentNode.id;
        $('#form-edit-key').val(key);
        $('#form-edit-form-edit-name').val($('#' + key + ' .name').text());
        $('#form-edit-mobile').val($('#' + key + ' .mobile').text());
        $('#form-edit-address').val($('#' + key + ' .address').text());
        $('#form-edit-ccPaymentMethod').val($('#' + key + ' .ccPaymentMethod').text());
        $('#form-edit-order').val($('#' + key + ' .order').text());
        $('#form-edit-price').val($('#' + key + ' .price').text());
        $('#modal-edit-message').modal('show');
    });

    // button "delete" for message
    $(document).on('click', '.button-delete', function(event){
        if(window.confirm('Are you sure you want to delete the message?')) {
            var key = this.parentNode.parentNode.parentNode.id;
            firebase.database().ref().child('orders/' + key).remove();
        }
    });
});