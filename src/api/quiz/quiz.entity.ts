import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../shared/base.entity';
import { Question } from './questions.entity';
import { User } from '../user/user.entity';

@Entity({ name: 'quizzes' })
export class Quiz extends BaseEntity {
  @Column({ unique: true })
  public title: string;

  @ManyToOne(() => User, (user) => user.quiz)
  @JoinColumn({ name: 'user_id' })
  public user: User;

  @OneToMany(() => Question, (question) => question.quiz, { cascade: true })
  public questions: Question[];
}