import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

export enum EntityType {
  Boat = 'boat',
  Shipyard = 'shipyard',
  Category = 'category',
}

export enum BoatDbModelType {
  MotorYacht = 'motor_yacht',
  SailingYacht = 'sailing_yacht',
  PowerBoat = 'power_boat',
}
  
@Entity({ name: 'database_embeddings' })
export class DatabaseEmbedding {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'entity_id',
    unique: true
  })
  entityId: number;
  
  @Column({
    name: 'entity_type',
    type: 'enum',
    enum: EntityType
  })
  entityType: EntityType;

  @Column({
    name: 'boat_model_type',
    type: 'enum',
    enum: BoatDbModelType, 
    nullable: true
  })
  boatModelType: BoatDbModelType;

  @Column()
  title: string;

  @Column()
  text: string;

  @Column({
    name: 'text_length'
  })
  textLength: number;

  @Column({
    nullable: true
  })
  tokens: number;

  @Column({ nullable: true })
  embeddings: string;
}
