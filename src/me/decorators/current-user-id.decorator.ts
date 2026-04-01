import { createParamDecorator, ExecutionContext, UnauthorizedException } from "@nestjs/common"
import { Request } from "express"

type UserPayload = {
	id?: string
	sub?: string
	userId?: string
}

type RequestWithUser = Request & {
	user?: UserPayload
}

export const CurrentUserId = createParamDecorator(
	(_: unknown, ctx: ExecutionContext): string => {
		const request = ctx.switchToHttp().getRequest<RequestWithUser>()

		const idFromUser =
			request.user?.id ?? request.user?.sub ?? request.user?.userId

		const headerValue = request.headers["x-user-id"]
		const idFromHeader = Array.isArray(headerValue) ? headerValue[0] : headerValue

		const userId = idFromUser ?? idFromHeader

		if (!userId) {
			throw new UnauthorizedException(
				"Missing user identity. Use authenticated request or provide x-user-id header"
			)
		}

		return userId
	}
)
