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

  constructor() {
    super();
    this.reinit();
  }

  reinit() {
    const
      cvs=AnalogClock.getCvs('ac-face');
    this.radius=cvs.width >cvs.height ? cvs.height/2 : cvs.width/2;

    this.paintClockFace();
    super.reinit();
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
    Рисуем циферблат
  */
  paintClockFace() {
    const
      cvs=AnalogClock.getCvs('ac-face'),
      ctx=AnalogClock.getCtx(cvs),
      ctr=AnalogClock.getCtr(cvs),
      r=this.radius-15;

    cvs.width+=0;  // clear canvas

    drawFaceDashes();
    drawFaceNumbers();

    /*
      Метки часов 1..12
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
          ctx.fillStyle='red';
          ctx.beginPath();
          ctx.arc(0,0, 3, 0,Math.PI*2);
          ctx.stroke();
          ctx.fill();
          ctx.fillStyle='gray';
        } else
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

    /*ctx.clearRect(0,0,cvs.width,cvs.height);
    ctx.beginPath();*/
    ///cvs.width=cvs.width;
    cvs.width+=0;

    var
      hour=((hms.h%12)*Math.PI/6)+
           (hms.m*Math.PI/(6*60))+
           (hms.s*Math.PI/(360*60));
    this.drawHand(cvs,ctx, hour, this.radius*0.5,17,'navy');
  }

  /*
    Рисуем минутную стрелку
  */
  displayMinutes(hms) {
    const
      cvs=AnalogClock.getCvs('ac-minute-hand'),
      ctx=AnalogClock.getCtx(cvs);

    // clearRect() - не работает!
    cvs.width+=0;

    var minute=(hms.m*Math.PI/30)+(hms.s*Math.PI/(30*60));
    this.drawHand(cvs,ctx, minute,this.radius*0.75,9,'green');
  }

  /*
    Рисуем секундную стрелку
  */
  displaySeconds(hms) {
    const
      cvs=AnalogClock.getCvs('ac-second-hand'),
      ctx=AnalogClock.getCtx(cvs);

    // clearRect()
    cvs.width+=0;

    this.drawHand(cvs,ctx,hms.s*Math.PI/30,this.radius-7,1,'red');
  }

  /*
    Рисует стрелку по заданным параметрам
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
    const hms=time2HMS(new Date());
    this.displayHours(hms);
    this.displayMinutes(hms);
  }

  /* -------------------------------------------------------- */

  drawFace() {
    const
      ctx=AnalogClock.getCtx('ac-face');

    ctx.fillStyle='rgb(200,0,0)';
    ctx.fillRect(10,10, 55,50);

    ctx.fillStyle='rgba(0,0,200, 0.5)';
    ctx.fillRect(30,30, 55,50);

    ctx.strokeStyle='green';
    ctx.strokeRect(9,9, 86,80);

    ctx.beginPath();
    ctx.moveTo(75, 50);
    ctx.lineTo(100, 75);
    ctx.lineTo(100, 25);
    ctx.fill();
  }

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
