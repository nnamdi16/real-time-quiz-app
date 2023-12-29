import { Column, Entity, ManyToOne } from 'typeorm';
import { Quiz } from './quiz.entity';
import { TestStatus, UserResponse } from '../dto/quiz.dto';
import { BaseEntity } from '../../../shared/base.entity';
import { User } from '../../user/entity/user.entity';

@Entity({ name: 'results' })
export class Results extends BaseEntity {
  @Column({ default: 0 })
  public score: number;

  @Column({ default: 0, name: 'total_score' })
  public totalScore: number;

  @Column({
    default: 0,
    name: 'streak_score',
    comment: 'Score as a result of attaining a streak',
  })
  public streakScore: number;

  @Column({
    default: 0,
    name: 'streak_count',
    comment: 'Keeps count of successive right answers',
  })
  public streakCount: number;

  @Column({ enum: TestStatus, type: 'enum', default: TestStatus.ONGOING })
  public status: TestStatus;

  @Column('jsonb', { default: [] })
  response: UserResponse[];

  @ManyToOne(() => Quiz, (quiz) => quiz.results)
  public quiz: Quiz;

  @ManyToOne(() => User, (user) => user.results)
  public user: User;
}
