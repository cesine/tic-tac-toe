import { InputType, PartialType } from '@nestjs/graphql';
import { CreateGameDto } from './create-game.dto';

@InputType()
export class UpdateGameDto extends PartialType(CreateGameDto) {}
