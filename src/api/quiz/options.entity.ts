import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../shared/base.entity';
import { Question } from './questions.entity';

@Entity({ name: 'options' })
export class Options extends BaseEntity {
  @Column()
  public text: string;

  @Column({ default: false, name: 'is_correct' })
  isCorrect: boolean;

  @ManyToOne(() => Question, (question) => question.options)
  question: Question;
}
