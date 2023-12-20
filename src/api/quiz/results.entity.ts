import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { Quiz } from './quiz.entity';
import { TestStatus, UserResponse } from './quiz.dto';
import { BaseEntity } from '../shared/base.entity';
import { User } from '../user/user.entity';

@Entity({ name: 'results' })
export class Results extends BaseEntity {
  @Column({ default: 0 })
  public score: number;

  @Column({ enum: TestStatus, type: 'enum', default: TestStatus.ONGOING })
  public status: TestStatus;

  @Column('jsonb', { default: [] })
  response: UserResponse[];

  @OneToOne(() => Quiz)
  @JoinColumn()
  public quiz: Quiz;

  @OneToOne(() => User)
  @JoinColumn()
  public user: User;
}
