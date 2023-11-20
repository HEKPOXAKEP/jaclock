/*
  =======================================
  Класс для отображения Аналоговых часов
  =======================================
*/
const
  DEG_1_SM=6,          // градусов на 1 секунду и минуту
  DEG_1_HR=30,         // градусов на 1 час
  RAD_ZERO=d2r(-90);   // начало отсчёта 12:00

function d2r(dgrs) {
  return (Math.PI/180)*dgrs;
}

class AnalogClock extends AClock {
  prevHMS={h:-1,m:-1,s:-1};  // передыдущее время
  prevHourAngle=-1;     // предыдущий угол часовой стрелки
  prevMinuteAngle=-1;   // предыдущий угол минутной стрелки
  prevSecondAngle=-1;   // предыдущий угол секундной стрелки

  constructor() {
    super();
    this.init();
  }

  init() {
    const
      cvs=AnalogClock.getCvs('ac-face');
    this.radius=cvs.width >cvs.height ? cvs.height/2 : cvs.width/2;

    this.paintClockFace();
    super.init();
  }

  /*
    Холст по id
  */
  static getCvs(id) {
    return document.getElementById(id);
  }

  /*
    Контекст холста.
    v - id холста или его объект
  */
  static getCtx(v) {
    if (typeof v ==='string')
      return AnalogClock.getCvs(v).getContext('2d');
    else
      return v.getContext('2d');
  }

  /*
    Координаты центра холста.
    v - id холста или его объект
  */
  static getCtr(v) {
    if (typeof v ==='string')
      var cvs=AnalogClock.getCvs(v);
    else
      cvs=v;

    return {x:cvs.width/2,y:cvs.height/2};
  }

  /*
    Очистка всего холста
  */
  static clearCanvas(cvs) {
    /*ctx.clearRect(0,0,cvs.width,cvs.height);
    ctx.beginPath();*/
    ///cvs.width=cvs.width;
    cvs.width+=0;
  }

  /*
    Установка обработчиков событий
  */
  setupEvents() {
    // связываем обработчики событий с контекстом this класса
    this.boundToggleClockMode = this.toggleClockMode.bind(this);
    this.boundAlarmOnOff = this.alarmOnOff.bind(this);
    this.boundAlarmButtonsClick = this.alarmButtonsClick.bind(this);  // кнопки Ч-Ч и М-М

    document.getElementById('ac-mode-btn').addEventListener('click', this.boundToggleClockMode, true);
    document.getElementById('ac-alarm-flag').addEventListener('click', this.boundAlarmOnOff, true);

    var
      abtns = document.querySelectorAll('.ac-set-alarm-btn');

    Array.from(abtns).forEach((btn) => {
      btn.addEventListener('click', this.boundAlarmButtonsClick, true);
    });
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
    Рисуем циферблат
  */
  paintClockFace() {
    const
      cvs=AnalogClock.getCvs('ac-face'),
      ctx=AnalogClock.getCtx(cvs),
      ctr=AnalogClock.getCtr(cvs),
      r=this.radius-15;

    AnalogClock.clearCanvas(cvs);

    drawFaceDashes();
    drawFaceNumbers();

    /*
      Цифры часов 1..12
    */
    function drawFaceNumbers() {
      var ang;

      ctx.translate(ctr.x,ctr.y);

      ctx.font=r*0.14+'px arial';
      ctx.textBaseline='middle';
      ctx.textAlign='center';
      ctx.fillStyle='navy';

      for (let n=1; n <13; n++) {
        ang=n*Math.PI/6;

        ctx.rotate(ang);
        ctx.translate(0,-r*0.89);
        ctx.rotate(-ang);

        ctx.fillText(n.toString(),0,0);

        ctx.rotate(ang);
        ctx.translate(0,r*0.89);
        ctx.rotate(-ang);
      }

      //ctx.translate(-cvs.width/2,-cvs.height/2);
      ctx.setTransform(1,0,0,1,0,0);
    }

    /*
      Деления по кругу циферблата
    */
    function drawFaceDashes() {
      var ang;

      ctx.translate(ctr.x,ctr.y);

      ctx.strokeStyle='black';
      ctx.lineWidth=1;

      for (let i=0; i <60; i++) {
        ang=d2r(i*DEG_1_SM);

        ctx.rotate(ang);
        ctx.translate(0,-r-2);
        ctx.rotate(-ang);

        if (i%5 ==0) {
          // у каждого часа - кружок
          ctx.fillStyle='red';
          ctx.beginPath();
          ctx.arc(0,0, 3, 0,Math.PI*2);
          ctx.stroke();
          ctx.fill();
          ctx.fillStyle='gray';
        } else
          // рисуем деление
          ctx.fillRect(0,0,3,3);

        ctx.rotate(ang);
        ctx.translate(0,r+2);
        ctx.rotate(-ang);
      }

      ctx.setTransform(1,0,0,1,0,0);
    }
  }

  /*
    Рисуем часовую стрелку
  */
  displayHours(hms) {
    const
      cvs=AnalogClock.getCvs('ac-hour-hand'),
      ctx=AnalogClock.getCtx(cvs);

    const
      hour=((hms.h%12)*Math.PI/6)+
            (hms.m*Math.PI/(6*60))+
            (hms.s*Math.PI/(360*60));

    if (this.prevHourAngle ==hour) return;
    this.prevHMS.h=hms.h;
    this.prevHourAngle=hour;

    AnalogClock.clearCanvas(cvs);

    this.drawHand(cvs,ctx, hour, this.radius*0.5,17,'navy');
  }

  /*
    Рисуем минутную стрелку
  */
  displayMinutes(hms) {
    const
      cvs=AnalogClock.getCvs('ac-minute-hand'),
      ctx=AnalogClock.getCtx(cvs);

    const minute=(hms.m*Math.PI/30); ///+(hms.s*Math.PI/(30*60));

    if (this.prevMinuteAngle ==minute) return;
    this.prevHMS.m=hms.m;
    this.prevMinuteAngle=minute;

    // clearRect() - не работает!
    AnalogClock.clearCanvas(cvs);

    this.drawHand(cvs,ctx, minute,this.radius*0.75,9,'green');
  }

  /*
    Рисуем секундную стрелку
  */
  displaySeconds(hms) {
    const
      cvs=AnalogClock.getCvs('ac-second-hand'),
      ctx=AnalogClock.getCtx(cvs);

    const second=hms.s*Math.PI/30;

    this.prevHMS.s=hms.s;

    if (this.prevSecondAngle ==second) return;
    this.prevSecondAngle=second;

    AnalogClock.clearCanvas(cvs);

    this.drawHand(cvs,ctx,second,this.radius-7,1,'red');
  }

  /*
    Рисует стрелку по заданным параметрам:
      cvs - холст
      ctx - контекст холста
      ang - угол стрелки
      len - длина стрелки
      wdth - ширина стрелки
      clr - цвет стрелки
  */
  drawHand(cvs,ctx,ang,len,wdth,clr) {
    ctx.translate(cvs.width/2,cvs.height/2);

    ctx.beginPath();
    ctx.lineWidth=wdth;
    ctx.strokeStyle=clr;
    ctx.lineCap='round';
    ctx.moveTo(0,0);
    ctx.rotate(ang);
    ctx.lineTo(0,-len);
    ctx.stroke();
    ctx.rotate(-ang);

    ctx.setTransform(1,0,0,1,0,0);
  }

  updateClockFace() {
    if (app.clkMode =='cmClock') {
      // режим время
      const hms=time2HMS(new Date());
      this.prevHourAngle=-1;
      this.prevMinuteAngle=-1;
      this.displayTime(hms);
      this.displayTimeInWords(hms.h,hms.m);
      document.getElementById('ac-alarm-face').style.visibility='hidden';
    } else {  // app.clkMode==cmAlarm
      clearHands();
      this.displayAlarmTime();
      this.displayTimeInWords();
      document.getElementById('ac-alarm-face').style.visibility='visible';
    }

    function clearHands() {
      AnalogClock.clearCanvas(AnalogClock.getCvs('ac-hour-hand'));
      AnalogClock.clearCanvas(AnalogClock.getCvs('ac-minute-hand'));
      AnalogClock.clearCanvas(AnalogClock.getCvs('ac-second-hand'));
    }
  }

  /*
    Отображает время будильника
  */
  displayAlarmTime() {
    const
      hh=this.tmpTime.h.toString(),
      mm=this.tmpTime.m.toString().padStart(2,'0'),
      hh1=document.getElementById('ac-hh1'),
      hh2=document.getElementById('ac-hh2');

    if (hh.length ===1) {
      hh1.setAttribute('src',DIGIT_IMG_SRC.replace('0','none'));
      hh2.setAttribute('src',DIGIT_IMG_SRC.replace('0',hh[0]));
    } else {
      hh1.setAttribute('src',DIGIT_IMG_SRC.replace('0',hh[0]));
      hh2.setAttribute('src',DIGIT_IMG_SRC.replace('0',hh[1]));
    }

    document.getElementById('ac-mm1').setAttribute('src',DIGIT_IMG_SRC.replace('0',mm[0]));
    document.getElementById('ac-mm2').setAttribute('src',DIGIT_IMG_SRC.replace('0',mm[1]));
  }

  /*
    Отображение/скрытие кнопок установки будильника
  */
  updateButtons() {
    const
      btns=document.querySelectorAll('.ac-set-alarm-btn');

    btns.forEach((curEl,curIdx,curObj) => {
      if (app.clkMode =='cmClock')
        curEl.style.visibility='hidden';
      else
        curEl.style.visibility='visible';
    });

    document.getElementById('ac-mode-lbl').innerHTML=app.clkMode =='cmClock' ? 'ВРЕМЯ' : 'УСТАНОВКА БУДИЛЬНИКА';

    if (app.clkMode =='cmClock') {
      document.getElementById('ac-hh-lbl').innerHTML='&nbsp;';
      document.getElementById('ac-mm-lbl').innerHTML='&nbsp;';
    } else {
      document.getElementById('ac-hh-lbl').innerHTML='часы';
      document.getElementById('ac-mm-lbl').innerHTML='минуты';
    }
  }

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
      document.getElementById('ac-alarm-flag').classList.add('alarm-on');
    } else {
      document.getElementById('ac-alarm-flag').classList.remove('alarm-on');
    }
  }
  /*
    Отображает время прописью
  */
  displayTimeInWords(h,m) {
    document.getElementById('ac-time-in-words-led').innerHTML=!h ? '&nbsp;' : TimeSpeaker.timeInWords(h,m);
  }

  /* -------------------------------------------------------- */

  drawSmile() {
    const
      ctx=AnalogClock.getCtx('ac-face');

    ctx.beginPath();
    ctx.lineWidth=1;
    ctx.arc(75,75,50,0,Math.PI*2,true); // Внешняя окружность
    ctx.moveTo(110,75);
    ctx.lineWidth=3;
    ctx.strokeStyle='red';
    ctx.arc(75,75,35,0,Math.PI,false); // рот (по часовой стрелке)
    ctx.moveTo(65,65);
    ctx.strokeStyle='black';
    ctx.arc(60,65,5,0,Math.PI*2,true); // Левый глаз
    ctx.moveTo(95, 65);
    ctx.arc(90,65,5,0,Math.PI*2,true); // Правый глаз
    ctx.stroke();
  }

} /* --- Class AnalogClock --- */

/*
  Регистрируем класс визуализатора Аналоговых часов.
*/
registerClockClass('clkAnalog',AnalogClock);
