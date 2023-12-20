import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from '../shared/base.entity';
import { Quiz } from '../quiz/quiz.entity';
import { Results } from '../quiz/results.entity';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @Column({ unique: true })
  public username: string;

  @Column()
  public password: string;

  @Column({ unique: true })
  public email: string;

  @Column({ nullable: true })
  public refreshToken: string;

  @OneToMany(() => Quiz, (quiz) => quiz.user, { cascade: true })
  public quiz: Quiz[];

  @OneToOne(() => Results)
  result: Results;
}
