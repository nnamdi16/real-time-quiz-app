import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../shared/base.entity';
import { Question } from './questions.entity';
import { User } from '../../user/entity/user.entity';
import { Results } from './results.entity';

@Entity({ name: 'quizzes' })
export class Quiz extends BaseEntity {
  @Column({ unique: true })
  public title: string;

  @ManyToOne(() => User, (user) => user.quiz)
  public user: User;

  @OneToMany(() => Question, (question) => question.quiz, { cascade: true })
  public questions: Question[];

  @OneToMany(() => Results, (result) => result.quiz, { cascade: true })
  results: Results[];

  @Column({
    comment: 'The number of correct answers to win a streak',
    default: 3,
  })
  public streak: number;

  @Column({
    name: 'streak_score',
    comment: 'The score attached to winning a streak',
    default: 10,
  })
  public streakScore: number;
}
