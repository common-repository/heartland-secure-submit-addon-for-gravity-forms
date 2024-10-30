/*jslint browser:true, unparam:true*/
/*global hps, gforms_securesubmit_admin_strings, ajaxurl*/
(function (window, $) {
  window.SecureSubmitAdminClass = function () {
    this.sendEmailFields = ['recipient_address'];
    this.enableThreeDSecureFields = ['api_identifier', 'org_unit_id', 'api_key'];

    this.validateKey = function (keyName, key) {
      if (key.length === 0) {
        this.setKeyStatus(keyName, "");
        return;
      }

      $('#' + keyName).val(key.trim());

      this.setKeyStatusIcon(keyName, "<img src='" + gforms_securesubmit_admin_strings.spinner + "'/>");

      if (keyName === "public_api_key") {
        this.validatePublicApiKey(keyName, key);
      } else {
        this.validateSecretApiKey(keyName, key);
      }
    };

    this.validateSecretApiKey = function (keyName, key) {
      $.post(
        ajaxurl,
        {
          action : "gf_validate_secret_api_key",
          keyName: keyName,
          key : key
        },
        function (response) {
          response = response.trim();

          if (response === "valid") {
            window.SecureSubmitAdmin.setKeyStatus(keyName, "1");
          } else if (response === "invalid") {
            window.SecureSubmitAdmin.setKeyStatus(keyName, "0");
          } else {
            window.SecureSubmitAdmin.setKeyStatusIcon(keyName, gforms_securesubmit_admin_strings.validation_error);
          }
        }
      );
    };

    this.validatePublicApiKey = function (keyName, key) {
      this.setKeyStatusIcon(keyName, "<img src='" + gforms_securesubmit_admin_strings.spinner + "'/>");

      var hps = new Heartland.HPS({
        publicKey: key,
        cardNumber: '4111111111111111',
        cardCvv: '123',
        cardExpMonth: '12',
        cardExpYear: '2025',
        success: function (response) {
          if (response.object === 'token') {
            window.SecureSubmitAdmin.setKeyStatus(keyName, "1");
          } else {
            window.SecureSubmitAdmin.setKeyStatus(keyName, "0");
          }
        },
        error: function (response) {
          window.SecureSubmitAdmin.setKeyStatus(keyName, "0");
        }
      });

      hps.tokenize();
    };

    this.initKeyStatus = function (keyName) {
      if ($('#' + keyName + '_is_valid').length <= 0) {
        return;
      }
      var is_valid = $('#' + keyName + '_is_valid').val();
      var key = $('#' + keyName).val();

      if (is_valid.length > 0) {
        this.setKeyStatus(keyName, is_valid);
      } else if (key.length > 0) {
        this.validateKey(keyName, key);
      }
    };

    this.setKeyStatus = function (keyName, is_valid) {
      $('#' + keyName + '_is_valid').val(is_valid);

      var iconMarkup = "";
      if (is_valid === "1") {
        iconMarkup = "<i class=\"fa icon-check fa-check gf_valid\"></i>";
      } else if (is_valid === "0") {
        iconMarkup = "<i class=\"fa icon-remove fa-times gf_invalid\"></i>";
      }

      this.setKeyStatusIcon(keyName, iconMarkup);
    };

    this.setKeyStatusIcon = function (keyName, iconMarkup) {
      var icon = $('#' + keyName + "_status_icon");
      if (icon.length > 0) {
        icon.remove();
      }

      $('#' + keyName).after("<span id='" + keyName + "_status_icon'>&nbsp;&nbsp;" + iconMarkup + "</span>");
    };

    this.initSendEmailFieldsToggle = function () {
      this.toggleSendEmailFields($('#gaddon-setting-row-send_email input:checked').val());
    };

    this.toggleSendEmailFields = function (value) {
      if (value === 'yes') {
        this.toggleFields(this.sendEmailFields, 'send_email', 'show');
      } else {
        this.toggleFields(this.sendEmailFields, 'send_email', 'hide');
      }
    };
    
    this.initEnableThreeDSecureFieldsToggle = function () {
      this.toggleEnableThreeDSecureFields($('#gaddon-setting-row-enable_threedsecure input:checked').val());
    };

    this.toggleEnableThreeDSecureFields = function (value) {
      if (value === 'yes') {
        this.toggleFields(this.enableThreeDSecureFields, 'enable_threedsecure', 'show');
      } else {
        this.toggleFields(this.enableThreeDSecureFields, 'enable_threedsecure', 'hide');
      }
    };

    this.toggleFields = function (fields, prefix, showOrHide) {
      var length = fields.length;
      var i, field;
      for (i = 0; i < length; i++) {
        field = fields[i];
        if (showOrHide === 'show') {
          $('#gaddon-setting-row-' + prefix + '_' + field).show();
        } else {
          $('#gaddon-setting-row-' + prefix + '_' + field).hide();
        }
      }
    };

    this.initAdminCCFields = function () {
      var $fields = $('#iframesCardNumber,#iframesCardExpiration,#iframesCardCvv');
      var that = this;
      if ($fields.length > 0) {
        $fields.children().remove();
        $fields.each(function (i, field) {
          field.append(that.getDummyField(field));
        });
      }
    };

    this.getDummyField = function (field) {
      var input = document.createElement('input');
      input.type = 'tel';
      input.disabled = true;

      switch (field.id) {
        case 'iframesCardNumber':
          input.placeholder = '•••• •••• •••• ••••';
          break;
        case 'iframesCardExpiration':
          input.placeholder = 'MM / YYYY';
          break;
        case 'iframesCardCvv':
          input.placeholder = 'CVV';
          break;
      }

      return input;
    };
  };

  $(document).ready(function () {
    window.SecureSubmitAdmin = new window.SecureSubmitAdminClass();

    window.SecureSubmitAdmin.initKeyStatus('public_api_key');
    window.SecureSubmitAdmin.initKeyStatus('secret_api_key');
    window.SecureSubmitAdmin.initEnableThreeDSecureFieldsToggle();
    window.SecureSubmitAdmin.initSendEmailFieldsToggle();
    window.SecureSubmitAdmin.initAdminCCFields();
  });
})(window, window.jQuery);