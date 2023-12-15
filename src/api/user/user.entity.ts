import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../shared/base.entity';

@Entity({ name: 'user' })
export class UserEntity extends BaseEntity {
  @Column({ unique: true })
  public username: string;

  @Column()
  public password: string;

  @Column({ unique: true })
  public email: string;
}
