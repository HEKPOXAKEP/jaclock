/*
  =======================================
  Класс для отображения Цифровых часов
  =======================================
*/
const
  DIGIT_IMG_SRC='img/Digit-0.png';

class DigitalClock extends AClock {

  constructor() {
    super();
    this.reinit();
  }

  /*
    Установка обработчиков событий
  */
  setupEvents() {
    // связываем обработчики событий с контекстом this класса
    this.boundToggleClockMode=this.toggleClockMode.bind(this);
    this.boundAlarmOnOff=this.alarmOnOff.bind(this);
    this.boundAlarmButtonsClick=this.alarmButtonsClick.bind(this);  // кнопки Ч-Ч и М-М
    
    document.getElementById('dc-mode-btn').addEventListener('click',this.boundToggleClockMode,true);
    document.getElementById('dc-alarm-flag').addEventListener('click',this.boundAlarmOnOff,true);

    var
      abtns=document.querySelectorAll('.dc-set-alarm-btn');

    Array.from(abtns).forEach((btn) => {
      btn.addEventListener('click',this.boundAlarmButtonsClick,true);
    });
  }

  /*
    Отображение часов
  */
  displayHours(hms) {
    const
      hh=hms.h.toString(),
      hh1=document.getElementById('dc-hh1'),
      hh2=document.getElementById('dc-hh2');

    if (hh.length ===1) {
      hh1.setAttribute('src',DIGIT_IMG_SRC.replace('0','none'));
      hh2.setAttribute('src',DIGIT_IMG_SRC.replace('0',hh[0]));
    } else {
      hh1.setAttribute('src',DIGIT_IMG_SRC.replace('0',hh[0]));
      hh2.setAttribute('src',DIGIT_IMG_SRC.replace('0',hh[1]));
    }
  }

  /*
    Отображение минут
  */
  displayMinutes(hms) {
    const
      mm=hms.m.toString().padStart(2,'0');

    document.getElementById('dc-mm1').setAttribute('src',DIGIT_IMG_SRC.replace('0',mm[0]));
    document.getElementById('dc-mm2').setAttribute('src',DIGIT_IMG_SRC.replace('0',mm[1]));
  }

  /*
    Отображение секунд
  */
  displaySeconds(hms) {
    const
      ss=hms.s.toString().padStart(2,'0');

    document.getElementById('dc-ss1').setAttribute('src',DIGIT_IMG_SRC.replace('0',ss[0]));
    document.getElementById('dc-ss2').setAttribute('src',DIGIT_IMG_SRC.replace('0',ss[1]));
  }

  /*
    Отображает время прописью
  */
  displayTimeInWords(h,m) {
    document.getElementById('dc-time-in-words-led').innerHTML=TimeSpeaker.time_in_words(h,m);
  }

  /*
    Клик по одной из кнопок установки времени будильника
  */
  alarmButtonsClick(ev) {
    clearSelection();
    app.timer.resetAlarmTimer();  // сбрасываем таймер выхода из режима установки

    switch (ev.target.id.split('-')[1]) {
      case 'hh':
        if (this.tmpTime.h <23) this.tmpTime.h++;
        else this.tmpTime.h=0;
        this.displayAlarmTime();
        break;
      case 'h2':
        break;
      case 'm1':
        if (this.tmpTime.m >=50) this.tmpTime.m-=50;
        else this.tmpTime.m+=10;
        this.displayAlarmTime();
        break;
      case 'm2':
        var
          mm=this.tmpTime.m.toString().padStart(2,0),
          m1=mm[0],
          m2=mm[1];

        if (m2 ==9) {
          this.tmpTime.m=Number(m1+'0');
        } else
          this.tmpTime.m++;
        this.displayAlarmTime();
        break;
      default:
        _warn('Клик по непонятной кнопке\n',ev.target);
    }
  }

  /*
    Переключение режима: время/установка будильника
  */
  toggleClockMode() {
    app.setClockMode(app.clkMode =='cmClock' ? 'cmAlarm' : 'cmClock');
    app.timer.setTimer(app.clkMode =='cmClock');

    if (app.clkMode =='cmClock') {
      // перешли в режим отображения времени
      app.timer.resetAlarmTimer(true);
      app.setAlarmTime(this.tmpTime);
    } else {
      // перешли в режим установки бдильника
      this.tmpTime=strToHMobj(app.alarmTime);
      app.timer.resetAlarmTimer();
    }

    this.updateButtons();
    this.updateClockFace();
  }

  /*
    Обновление циферблата в зависимости от режима
  */
  updateClockFace() {
    if (app.clkMode =='cmClock') {
      // режим время
      document.getElementById('dc-hh-mm-colon').setAttribute('src',DIGIT_IMG_SRC.replace('0','colon'));
      document.getElementById('dc-mm-ss-colon').setAttribute('src',DIGIT_IMG_SRC.replace('0','colon'));
      const hms=time2HMS(new Date());
      this.displayHours(hms);
      this.displayMinutes(hms);
    } else { // app.clkMode==cmAlarm
      // режим установка будильника
      document.getElementById('dc-hh-mm-colon').setAttribute('src',DIGIT_IMG_SRC.replace('0','colon').replace('png','gif'));
      document.getElementById('dc-mm-ss-colon').setAttribute('src',DIGIT_IMG_SRC.replace('0','none'));
      document.getElementById('dc-ss1').setAttribute('src',DIGIT_IMG_SRC.replace('0','none'));
      document.getElementById('dc-ss2').setAttribute('src',DIGIT_IMG_SRC.replace('0','none'));
      this.displayAlarmTime();
    }
  }

  /*
    Отображает время будильника
  */
  displayAlarmTime() {
    this.displayHours(this.tmpTime);
    this.displayMinutes(this.tmpTime);
  }

  /*
    Отображение/скрытие кнопок установки будильника
  */
  updateButtons() {
    const
      btns=document.querySelectorAll('.dc-set-alarm-btn');

    btns.forEach((curEl,curIdx,curObj) => {
      if (app.clkMode =='cmClock')
        curEl.style.visibility='hidden';
      else
        curEl.style.visibility='visible';
    });

    document.getElementById('dc-mode-lbl').innerHTML=app.clkMode =='cmClock' ? 'ВРЕМЯ' : 'УСТАНОВКА БУДИЛЬНИКА';

    if (app.clkMode =='cmClock') {
      document.getElementById('dc-hh-lbl').innerHTML='&nbsp;';
      document.getElementById('dc-mm-lbl').innerHTML='&nbsp;';
    } else {
      document.getElementById('dc-hh-lbl').innerHTML='часы';
      document.getElementById('dc-mm-lbl').innerHTML='минуты';
    }
  }

  /*
    Вкл/выкл будильника
  */
  alarmOnOff(ev) {
    if (ev) {
      ev.preventDefault();
      ev.stopImmediatePropagation();
    }
    clearSelection();

    app.alarmOn=!app.alarmOn;

    this.updateAlarmFlag();
    setCookie('alarm-on',app.alarmOn);
  }

  /*
    Отображение лампочки будильника
  */
  updateAlarmFlag() {
    if (app.alarmOn) {
      document.getElementById('dc-alarm-flag').classList.add('alarm-on');
    } else {
      document.getElementById('dc-alarm-flag').classList.remove('alarm-on');
    }
  }
}

/*
  Регистрируем класс визуализатора Цифровых часов.
*/
registerClockClass('clkDigital',DigitalClock);
