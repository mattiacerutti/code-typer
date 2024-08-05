import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';

export const QueryRequired = createParamDecorator(
  (
    data: { param: string; allowedValues?: string[] },
    ctx: ExecutionContext,
  ) => {
    const request = ctx.switchToHttp().getRequest();
    const value = request.query[data.param];

    if (value === undefined) {
      throw new BadRequestException(
        `Missing required query param: '${data.param}'`,
      );
    }

    console.log(value.toLowerCase());

    if (
      data.allowedValues &&
      !data.allowedValues
        .map((val) => val.toLowerCase())
        .includes(value.toLowerCase())
    ) {
      throw new BadRequestException(
        `Invalid value for query param: '${data.param}'. Allowed values are: ${data.allowedValues.map((val) => val.toLowerCase()).join(', ')}`,
      );
    }

    return value;
  },
);
