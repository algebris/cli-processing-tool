import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Shipyard {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;
}
