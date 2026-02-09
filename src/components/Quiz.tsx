import { Component } from 'react'
import { Loading } from './Loading'
import { QuestionCard } from './QuestionCard'
import { Answer, Choice, Choices, Question } from '../types'
import { getChoices, getQuestions } from '../api/Api'
import { QuizResult } from './QuizResult'

type Props = { lang: string }

type State = {
  questions: Question[]
  currentQuestion: Question | null
  currentQuestionNumber: number
  choices: Choices | null
  answers: Answer[]
  lang: string
  error: string | null
}

export class Quiz extends Component<Props, State> {
  state: State = {
    questions: [],
    currentQuestion: null,
    currentQuestionNumber: 0,
    choices: null,
    answers: [],
    lang: 'en',
    error: null,
  }

  constructor(props: Props) {
    super(props)
    this.onAnswer = this.onAnswer.bind(this)
  }

  componentDidMount() {
    this.initQuestionsAndAnswers(this.props.lang)
  }

  componentDidUpdate() {
    if (this.state.lang === this.props.lang) {
      return
    }
    this.setState({ lang: this.props.lang })
    this.initQuestionsAndAnswers(this.props.lang)
  }

  onAnswer(choice: Choice) {
    this.setState((state, props) => {
      return {
        currentQuestionNumber: state.currentQuestionNumber + 1,
        currentQuestion: state.questions[state.currentQuestionNumber + 1],
        answers: state.answers.concat([
          new Answer(
            state.currentQuestion!.domain,
            state.currentQuestion!.facet,
            choice.score
          ),
        ]),
      }
    })
  }

  render() {
    if (
      this.state.currentQuestionNumber &&
      this.state.questions.length &&
      this.state.currentQuestionNumber >= this.state.questions.length
    ) {
      return (
        <QuizResult
          answers={this.state.answers}
          lang={this.props.lang}
          key={this.props.lang} // Re-mount when language is changed
        />
      )
    }

    if (this.state.error) {
      return (
        <div className='text-center p-5 m-5'>
          <p className='text-red-500 text-lg'>Failed to load quiz data.</p>
          <button
            className='mt-3 text-primary underline'
            onClick={() => {
              this.setState({ error: null })
              this.initQuestionsAndAnswers(this.props.lang)
            }}
          >
            Try again
          </button>
        </div>
      )
    }

    if (
      !this.state.choices ||
      !this.state.questions.length ||
      !this.state.currentQuestion
    ) {
      return <Loading></Loading>
    }

    let currentChoices = this.state.choices[this.state.currentQuestion.keyed]

    return (
      <QuestionCard
        question={this.state.currentQuestion}
        choices={currentChoices}
        onAnswer={this.onAnswer}
        number={this.state.currentQuestionNumber + 1}
        totalNumber={this.state.questions.length}
      ></QuestionCard>
    )
  }

  private initQuestionsAndAnswers(lang: string) {
    getQuestions(lang)
      .then((res) =>
        this.setState((state) => ({
          questions: res,
          currentQuestion: res[state.currentQuestionNumber],
        }))
      )
      .catch(() => this.setState({ error: 'Failed to load questions' }))
    getChoices(lang)
      .then((res) => this.setState({ choices: res }))
      .catch(() => this.setState({ error: 'Failed to load choices' }))
  }
}
