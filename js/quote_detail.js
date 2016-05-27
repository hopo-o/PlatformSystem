/**
 * Created by wx_h0001 on 2016/5/27.
 */

(function () {
    var number = getQueryString("x");
    var contact = getQueryString("c");
    if (number !== null)
    {
        //初始化页面
        initPage(number, contact);
        $('#validity').daterangepicker();
    }
    else
    {
        console.log("No Detail Number");
    }

    function initPage(number, contact) {
        $.ajax({
            url: "../../php/quote_detail.php",
            type: "POST",
            dataType: "json",
            data : {'detailNumber' : number, 'contact': contact},
            success: function (data) {
                $("#id").text(number);
                //var today = new Date();
                //$("#print_date").text(today.getFullYear() + "-" + (today.getMonth()+1) + "-" + today.getDate());
                if (data.quote.currency == 'RMB'){
                    $("#currency").val("RMB");
                    $(".currency").text("¥");
                }
                else{
                    $("#currency").val("USD");
                    $(".currency").text("$");
                }
                $("#customer_name").val(nullornot(data.quote.customer_name));
                $("#customer_id").text(nullornot(data.quote.customer_id));
                $("#contact_name").html("<option value='" + contact + "'>" + nullornot(data.quote.contact_name) + "</option>");
                $("#contact_tele").text(nullornot(data.quote.contact_tele));
                $("#contact_email").text(nullornot(data.quote.contact_email));
                $("#customer_addr").text(nullornot(data.quote.customer_addr));
                //$("#start").text(nullornot(data.quote.validity_start));
                //$("#end").text(nullornot(data.quote.validity_end));
                $("#validity").val(data.quote.validity_start + " - " + data.quote.validity_end);
                $(".nameUser").text(nullornot(data.userInfo.name));
                $(".teleUser").text(nullornot(data.userInfo.tele));
                $(".foxUser").text("-");
                $(".emailUser").text(nullornot(data.userInfo.email));
                var sum = 0;
                for(var i in data.products)
                {
                    var trID = "tr" + i;
                    $("<tr>").attr('id', trID).appendTo("#tbody_products");
                    $("<td></td>").text((parseInt(i) + 1) + ".").appendTo("#" + trID);
                    $("<td></td>").text(data.products[i].product_id).appendTo("#" + trID);
                    $("<td></td>").text(data.products[i].disc).appendTo("#" + trID);
                    $("<td></td>").text(data.products[i].orig_price).appendTo("#" + trID);
                    var taxRate = new Number(data.products[i].tax_rate);
                    $("<td></td>").text(data.products[i].discount + "%").appendTo("#" + trID);
                    $("<td></td>").text((taxRate * 100) + "%").appendTo("#" + trID);
                    //var price = new Number(data.products[i].orig_price) * (taxRate + 1);
                    var price = new Number(data.products[i].orig_price) * (new Number(data.products[i].discount) / 100) * (taxRate + 1);
                    $("<td></td>").text(price.toFixed(2)).appendTo("#" + trID);
                    $("<td></td>").text(data.products[i].amount).appendTo("#" + trID);
                    var totalPrice = price * (new Number(data.products[i].amount));
                    $("<td></td>").text(totalPrice.toFixed(2)).appendTo("#" + trID);
                    sum += totalPrice;
                }
                if(!isNaN(sum))
                {
                    $("#sum").text(sum.toFixed(2));
                }
                else
                {
                    $("#sum").text("数据有误");
                }
            }
        })
    }

    function nullornot(str){
        if(str === ""){
            return "-";
        }
        else {
            return str;
        }
    }

    //获取页面参数name
    function getQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    }

    //修改客户
    $("#editCustomer").click(function () {
        $("#customer_name").removeAttr("disabled");
        $("#contact_name").removeAttr("disabled");

        $("#customer_name").bigAutocomplete({
            url: "../../php/auto_customer.php",
            callback: function(data){
                var customerId = data.id;
                $("#customer_id").text(customerId);
                showCustomerInfo(customerId);

            }
        });
        showCustomerInfo($("#customer_id").text());

        $(this).addClass("disabled");
        $("#saveCustomer").removeClass("disabled");

        //修改客户保存
        $("#saveCustomer").unbind("click").click({customer : $("#customer_id").text(), contact : contact},function (e) {
            var newCustomerID = $("#customer_id").text();
            var newContactID = $("#contact_name").val();
            if(newCustomerID != e.data.customer || newContactID != e.data.contact){
                $.ajax({
                    url: "../../php/quote_edit_customer.php",
                    type: "POST",
                    data: {'newCustomerId': newCustomerID, 'newContactId': newContactID, 'quote': number},
                    success: function(data){
                        if (data === "0"){
                            alertMsg("已保存，修改成功", "success");
                        }
                        else{
                            alertMsg("保存失败", "danger");
                        }

                    }
                });
            }
            else {
                alertMsg("已保存，并无修改", "success");
            }

            $(this).addClass("disabled");
            $("#editCustomer").removeClass("disabled");
            $("#customer_name").attr("disabled",true);
            $("#contact_name").attr("disabled",true);
        });
    });

    //修改联系人
    $("#contact_name").change(function () {
        showContactInfo($(this).val());
    });

    //显示选中客户的信息
    function showCustomerInfo(customerID){
        $.ajax({
            url: "../../php/quote_edit_customer.php",
            type: "POST",
            data: {'customerId': customerID},
            dataType: "json",
            success: function(data){
                $("#customer_addr").text(data.addr);
                $("#contact_name").empty();
                data.contact.forEach(function(ele){
                    this.append("<option value='" + ele.id + "'>" + ele.name + "</option>");
                }, $("#contact_name"));

                showContactInfo(data.contact[0].id);
            }
        });
    }

    //选中联系人信息
    function showContactInfo(contactID){
        $.ajax({
            url: "../../php/quote_edit_customer.php",
            type: "POST",
            data: {'contactId': contactID},
            dataType: "json",
            success: function(data){
                $("#contact_tele").text(data.tele);
                $("#contact_email").text(data.email);
            }
        });
    }

    //修改报价单信息
    $("#editQuote").click(function () {
        $("#validity").removeAttr("disabled");
        $("#currency").removeAttr("disabled");
        $(this).addClass("disabled");
        $("#saveQuote").removeClass("disabled");

        $("#saveQuote").unbind('click').click({v: $("#validity").val(), c: $("#currency").val()}, function () {
            var _v = $("#validity").val();
            var _c = $("#currency").val().val();
            if(_v != v || _c != c){
                var validity = _v.split(" - ");
                $.ajax({
                    url: "../../php/quote_edit_quote.php",
                    type: "POST",
                    data: {'v': validity, 'c': _c, 'quote': number},
                    success: function(data){
                        if (data === "0"){
                            alertMsg("已保存，修改成功", "success");
                        }
                        else{
                            alertMsg("保存失败", "danger");
                        }

                    }
                });
            }
            else {
                alertMsg("已保存，并无修改", "success");
            }
        });

    });



})();