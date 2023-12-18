import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../shared/base.entity';
import { Quiz } from './quiz.entity';
import { Options } from './options.entity';

@Entity({ name: 'questions' })
export class Question extends BaseEntity {
  @Column()
  public title: string;

  @OneToMany(() => Options, (option) => option.question, { cascade: true })
  options: Options[];

  @ManyToOne(() => Quiz, (quiz) => quiz.questions)
  @JoinColumn({ name: 'quiz_id' })
  public quiz: Quiz;
}
