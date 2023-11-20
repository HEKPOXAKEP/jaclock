/*
  ===================
  Класс TimeSpeaker
  ===================
*/

const
  oauth_token='y0_AgAAAAAObVrtAATuwQAAAADx8ca8GoEOdx-GS1SV6jv_OCeakO4syE4';
  catalog_id='';

class TimeSpeaker {
  static
    HOURS=['ноль','один','два','три','четыре','пять','шесть',
    'семь','восемь','девять','десять','одиннадцать','двенадцать','тринадцать',
    'четырнадцать','пятнадцать','шестнадцать','семнадцать','восемнадцать',
    'девятнадцать','двадцать','двадцать один','двадцать два','двадцать три'];
  static
    MINS=['ноль','одна','две','три','четыре','пять','шесть',
    'семь','восемь','девять','десять','одиннадцать','двенадцать','тринадцать',
    'четырнадцать','пятнадцать','шестнадцать','семнадцать','восемнадцать',
    'девятнадцать'];

  /*
    Время прописью
  */
  static timeInWords(h, m) {
    var
      words='',
      ending_m=' минут',
      ending_h=' час';

    words+=this.HOURS[h]+' ';

    if ((h >10) && (h <20))
      ending_h+='ов';
    else {
      h=h%10;
      if ((h >1) && (h <5))
        ending_h+='а';
      else if (h ==1);
      else ending_h+='ов';
    }
    words+=ending_h+' ';

    if (m <20)
      words+=this.MINS[m];
    else {
      switch(Math.floor(m/10)) {
        case 2: words+='двадцать '; break;
        case 3: words+='тридцать '; break;
        case 4: words+='сорок '; break;
        case 5: words+='пятьдесят '; break;
      }
      if (m%10 !=0) words+=this.MINS[Math.abs(m%10)];
    }

    if ((m >10) && (m <20));
    else {
      m=m%10;
      if ((m >1) && (m <5)) ending_m+='ы';
      else if (m ==1) ending_m+='а';
    }
    words+=ending_m;

    return words;
  }

}
