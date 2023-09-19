export default class GridValues {
    constructor(theme, question1, answer1, question2, answer2, question3, answer3, question4, answer4, question5, answer5) {
      this.theme = theme;
      this.question1 = question1;
      this.answer1 = answer1;
      this.question2 = question2;
      this.answer2 = answer2;
      this.question3 = question3;
      this.answer3 = answer3;
      this.question4 = question4;
      this.answer4 = answer4;
      this.question5 = question5;
      this.answer5 = answer5;
    }
  
    toArray() {
      return [
        [this.theme],
        [this.question1, this.answer1],
        [this.question2, this.answer2],
        [this.question3, this.answer3],
        [this.question4, this.answer4],
        [this.question5, this.answer5]
      ];
    }
  }
