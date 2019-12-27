layui.use(['layer', 'form', 'element', 'laydate', 'carousel'], function () {
  layer = layui.layer,
    form = layui.form,
    element = layui.element,
    laydate = layui.laydate,
    carousel = layui.carousel



  layer.tips('点击隐藏或显示', '.mindBox .cardBox_btn', {
    tips: [2, '#a54d55'],
    time: 3000
  })
  //暂时不能够同时调用多个tips 调用会被覆盖 之后需要找到解决方法
  // layer.tips('文本框', '#msgText', {
  //   tips: [2, '#a54d55'],
  //   time: 3000
  // });
  // layer.tips('列表栏', '.msgBox .msgLog', {
  //   tips: [2, '#a54d55'],
  //   time: 3000
  // });




  //卡片面板事件
  element.on('collapse(cardBox_one)', function (data) {
    //data.show得到当前面板的展开状态，true或者false
    //data.title得到当前点击面板的标题区域DOM对象
    //data.content得到当前点击面板的内容区域DOM对象
    data.show && data.content.hide().slideDown() || data.content.show().slideUp()
  });




})

//日期数字格式化
let numFormate = (num) => num = num >= 10 ? num : '0' + num;

$('.cardBox_btn').click(function () {
  $('.cardBox').css('display') === 'block' && $(this).find('i').html('&#xe67a') || 'block' && $(this).find('i').html('&#xe67b')
  $('.cardBox').slideToggle(1000)

})


//Record实现
const msgBox = document.querySelector('.msgBox')
const msg = document.getElementById('msgText')
const msgBtn = msgBox.querySelector('.msgBtn')
const hisBtn = msgBox.querySelector('.hisBtn')
const msgLog = msgBox.querySelector('.msgLog')
const msgUl = msgLog.querySelector('ul')

let msgText
let data = []


//数据创建与插入
let msgAppend = (id, text, time) => {
  let msgLi = document.createElement('li')
  let spanText = document.createElement('span')
  //文本span
  spanText.innerHTML = text
  spanText.title = text
  //时间span
  let spanTime = document.createElement('span')
  spanTime.innerHTML = time
  //删除按钮
  let btnDel = document.createElement('button')
  btnDel.setAttribute('data-id', id)
  btnDel.innerHTML = '删除'
  btnDel.classList.add('btn_del', 'layui-btn')
  //往li插入已完成的元素
  msgLi.appendChild(spanText)
  msgLi.appendChild(spanTime)
  msgLi.appendChild(btnDel)
  //把已完成的li插入到列表的ul里面,在第一个子元素li之前插入
  msgUl.insertBefore(msgLi, msgUl.firstElementChild)

  return 'success'
}

//删除按钮点击事件
let msgDelete = () => {
  $('.msgLog>ul').click(function (e) {
    console.log('del')
    if (e.target.nodeName === 'BUTTON') {
      console.log(data)
      for (let i = 0; i < data.length; i++) {
        if (data[i].id === +$(e.target).attr('data-id')) {
          data.splice(i, 1)
        }
      }
      localStorage.setItem('MsgData', JSON.stringify(data))
      $(e.target).parent().remove()


    }

  })

}

function getItem() {
  const tempData = localStorage.getItem('MsgData')
  if (tempData) {
    data = JSON.parse(tempData)
    for (let i = 0; i < data.length; i++) {
      let {
        id,
        text,
        time
      } = data[i]
      msgAppend(id, text, time)
    }

  }
}


let msgBtnControl = () => {
  layer.tips('发布按钮可以使用 测试一下吧', '.msgBox .msgBtn', {
    tips: [2, '#660C0B'],
    time: 4000
  })

  //发布按钮点击事件
  $('.msgBox .msgBtn').on('click', function () {
    let text = msg.value.trim()
    let nowaday = new Date()
    let id = +nowaday
    let time = numFormate((nowaday.getMonth() + 1)) + '月' + numFormate(nowaday.getDate()) + '日 ' + numFormate(nowaday.getHours()) + ':' + numFormate(nowaday.getMinutes()) + ':' + numFormate(nowaday.getSeconds());
    if (text) {
      msgAppend(id, text, time)
      msg.value = ''
      let obj = {
        id,
        text,
        time
      }
      data.push(obj)
      localStorage.setItem('MsgData', JSON.stringify(data))
      layer.msg('Message Success!!!', {
        icon: 1,
        anim: 4
      });
    }

  })
}


//MindArea
const mindBox = document.querySelector('.mindBox')
const userBox = document.querySelector('.userBox')
const qustArea = userBox.querySelector('.qustArea')
const answerArea = userBox.querySelector('.answerArea')
const $qustTitle = $('.userBox .qustArea .qust_title')
const $qustCase = $('.userBox .qustArea .qust_case')
const $asTitle = $('.userBox .answerArea .as_title')
const $asHandle = $('.userBox .answerArea .as_handle')
const $btnOk = $('.userBox .answerArea .as_handle .btn_ok')

let main = () => {
  console.log('start');
  let count = 0
  let dataAll
  let getData = () => {
    $.ajax({
      type: "GET",
      async: true,
      url: "../data/dataOne.json",
      data: "",
      dataType: "JSON",
      success: function (data) {
        // console.log(data)
        dataAll = data
      },
      error: function () {
        console.log('error')
      }

    });
  }
  getData()

  //问题处理
  let qustFn = (tempQ) => {
    console.log('qustFn')
    $('.ipt_as').val('')
    $($qustTitle).children('span').html(tempQ.title).hide().fadeIn(1000)
    $($qustCase).html('')
    let tempP
    for (let i in tempQ) {
      if (i == 'title' || i == 'result') continue
      tempP = '<p class="startHide">'
      tempP += i + ' : ' + tempQ[i]
      tempP += '</p>'
      $($qustCase).append(tempP)
    }
    $($qustCase).children('p').fadeIn(1500)

  }

  //答题框确认按钮点击事件
  $btnOk.click(function () {
    let answer = $('.ipt_as').val()
    if (!dataAll) {
      layer.msg('Loading...', {
        icon: 16,
        time: 1200,
        shade: 0.35
      })
      getData()
      return false
    }
    let quesList = dataAll.question
    let quesLen = 0 || quesList.length
    let proRate = 100 / (quesLen - 1)
    // let rsList = dataAll.result
    console.log(quesList)
    console.log(count)
    console.log(proRate)
    if (count == 0 ? answer == 1 : (answer == quesList[count - 1]['result'] || answer == '```')) {
      layer.msg('回答正确', {
        icon: 1,
        time: 1000,
        shadeClose: true,
        anim: 3
      })

      let tempQ = quesList[count]
      console.log(tempQ)
      qustFn(tempQ)
      count === 10 && msgBtnControl()
      element.progress('collaProbar_one', count * proRate + '%')

      count != quesLen - 1 && count++
    } else {
      layer.msg('回答错误，请再次输入', {
        icon: 2,
        time: 1500,
        shade: 0.35,
        shadeClose: true,
        anim: 6
      })

    }
  })

  //答题输入框键盘事件 按下回车确认
  $('.answerArea .as_handle .ipt_as').keyup(function (e) {
    e.keyCode == 13 && ($btnOk.click())
  })

  $('#msgText').keyup(function (e) {
    if (e.keyCode === 13 && e.ctrlKey) {
      console.log('hoho')

      $('.msgBox .msgBtn').click()
    }
  })


  getItem()
  // msgBtnControl()
  // msgDelete()



}


main()