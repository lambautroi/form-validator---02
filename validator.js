function validator(formSelector, formGroup, errorSelector) {
  //muốn thực hiện cái value  ta phải hiện thực hóa nó thành
  // 1 cái function (ibject chứa function)
  // tạo ra các finc trùng tên vs value (fullname ='requỉed')
  var formRules = {};

  var _this = this;

  // tạo ra 1 cái object để lưu các rules
  /**
   * Quy ước tạo rule:
   * - nếu có lỗi thì return 'errorMessage'
   * - nếu ko có lỗi thì return undefined
   */
  var validatorRules = {
    required: function (value) {
      return value ? undefined : 'Vui lòng nhập trường này';
    },
    email: function (value) {
      var fomat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (fomat.test(value.trim())) {
        return undefined;
      } else return 'Trường này không phải email';
    },
    password: function (value) {
      var fomat = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}$/;
      if (fomat.test(value)) {
        return undefined;
      } else return 'mật khẩu phải có 8-20 kí tự , có chữ thường và chữ in hoa';
    },
  };

  //lấy ra element trong DOM theo `formSelector`
  var formElement = document.querySelector(formSelector);

  //nếu có form thì mình xử lí
  if (formElement) {
    var inputs = formElement.querySelectorAll('[name][rules]');
    inputs.forEach(function (input) {
      var rules = input.getAttribute('rules').split('|');
      for (var rule of rules) {
        if (Array.isArray(formRules[input.name])) {
          formRules[input.name].push(validatorRules[rule]);
        } else {
          formRules[input.name] = [validatorRules[rule]];
        }
      }
    });

    //lắng nghe sự kiện để validate (blur , change, ...)
    for (var input of inputs) {
      //xử lí khi mình blur ra khỏi input
      input.onblur = handleValidate;
      //xử lí khi nhấn vô ô input
      input.onmousedown = function (event) {
        var parentElement = getParent(event.target, formGroup);
        var errorElement = parentElement.querySelector(errorSelector);
        errorElement.innerText = '';
        parentElement.classList.remove('invalid');
      };
    }
    //hàm thực hiện validate
    function handleValidate(event) {
      var parentElement = getParent(event.target, formGroup);
      var errorElement = parentElement.querySelector(errorSelector);
      var errorMessage;
      for (var i = 0; i < formRules[event.target.name].length; ++i) {
        errorMessage = formRules[event.target.name][i](event.target.value);
        if (errorMessage) break;
      }

      if (errorMessage) {
        errorElement.innerText = errorMessage;
        parentElement.classList.add('invalid');
      } else {
        errorElement.innerText = '';
        parentElement.classList.remove('invalid');
      }
      return !errorMessage;
    }

    //xử lí sự kiện submit của form
    formElement.onsubmit = function (e) {
      e.preventDefault();

      var isFormValid = true;
      inputs.forEach(function (input) {
        var inputs = formElement.querySelectorAll('[name][rules]');
        for (input of inputs) {
          handleValidate({ target: input });
          if (!handleValidate({ target: input })) {
            isFormValid = false;
          }
        }
      });

      if (isFormValid) {
        if (typeof _this.onSubmit === 'function') {
          var enableInputs = formElement.querySelectorAll('[name]');
          var formValues = Array.from(enableInputs).reduce(function (
            values,
            input
          ) {
            //phù hợp cho từng kiểu input khác nhau
            switch (input.type) {
              case 'radio':
                values[input.name] = formElement.querySelector(
                  'input[name="' + input.name + '"]:checked'
                ).value;
                break;
              case 'checkbox':
                if (!input.matches(':checked')) {
                  values[input.name] = '';
                  return values;
                }
                if (!Array.isArray(values[input.name])) {
                  values[input.name] = [];
                }
                values[input.name].push(input.value);
                break;
              case 'file':
                values[input.name] = input.files;
                break;
              default:
                values[input.name] = input.value;
            }
            return values;
          },
          {});
          _this.onSubmit(formValues);
        } else formElement.onsubmit();
      }
    };
  }
}
//Hàm lấy thẻ cha của phần tử
function getParent(element, formGroup) {
  while (element.parentElement) {
    if (element.parentElement.matches(formGroup)) {
      return (element = element.parentElement);
    }
    element = element.parentElement;
  }
}
