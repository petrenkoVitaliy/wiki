import { HttpException, HttpStatus } from '@nestjs/common';

class VerboseHttpException extends HttpException {
  code: number;

  constructor(response: string, status: number) {
    super(response, status);

    this.code = status;
  }
}

export class ErrorGenerator {
  static notUniqueProperty(options: { propertyName: string }) {
    return new VerboseHttpException(`${options.propertyName} must be unique`, HttpStatus.CONFLICT);
  }

  static notFound(options: { entityName: string }) {
    return new VerboseHttpException(`${options.entityName} isn't exist`, HttpStatus.NOT_FOUND);
  }

  static invalidEntity(options: { entityName: string }) {
    return new VerboseHttpException(
      `${options.entityName} should exist`,
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }

  static duplicateEntity(options: { entityName: string }) {
    return new VerboseHttpException(`${options.entityName} already exists`, HttpStatus.BAD_REQUEST);
  }

  static alreadyActualSchema() {
    return new VerboseHttpException('Schema is already actual', HttpStatus.FORBIDDEN);
  }

  static alreadyApprovedSchema() {
    return new VerboseHttpException('Invalid schema to approve', HttpStatus.FORBIDDEN);
  }
}
