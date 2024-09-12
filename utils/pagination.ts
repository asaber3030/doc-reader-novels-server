export function createPagination(
  pageParam: number,
  limitParam: number,
  orderByParam: string,
  orderTypeParam: string,
  skipLimit: boolean = false,
) {
  const page = pageParam ?? 1;
  const limit = limitParam ?? (skipLimit ? null : 10);
  const orderBy = orderByParam ?? 'id';
  const orderType = orderTypeParam ?? 'desc';

  let skip = 0;

  if (limit) {
    skip = (page - 1) * (skipLimit ? 0 : limit);
  }

  return {
    orderBy: orderBy as string,
    orderType: orderType as 'ASC' | 'DESC',
    skip,
    limit,
    page,
  };
}
