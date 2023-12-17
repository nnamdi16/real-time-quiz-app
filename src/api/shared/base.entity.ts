import { UUID } from 'crypto';
import {
  BeforeUpdate,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: UUID;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedDate: Date;

  @Column({ type: 'varchar', length: 300, nullable: true })
  createdBy: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  updatedBy: string;

  @BeforeUpdate()
  updateTimestamp() {
    this.updatedDate = new Date();
  }
}
