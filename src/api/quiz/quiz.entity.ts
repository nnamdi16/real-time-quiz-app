import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../shared/base.entity';
import { Question } from './questions.entity';
import { User } from '../user/user.entity';
import { Results } from './results.entity';

@Entity({ name: 'quizzes' })
export class Quiz extends BaseEntity {
  @Column({ unique: true })
  public title: string;

  @ManyToOne(() => User, (user) => user.quiz)
  public user: User;

  @OneToMany(() => Question, (question) => question.quiz, { cascade: true })
  public questions: Question[];

  @OneToMany(() => Results, (result) => result.quiz)
  results: Results[];
}
