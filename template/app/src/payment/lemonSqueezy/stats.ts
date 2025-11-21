import { listOrders } from "@lemonsqueezy/lemonsqueezy.js";

export async function fetchTotalLemonSqueezyRevenue() {
  let totalRevenue = 0;
  let hasNextPage = true;
  let currentPage = 1;

  while (hasNextPage) {
    const response = await listOrders({
      filter: {
        storeId: process.env.LEMONSQUEEZY_STORE_ID,
      },
      page: {
        number: currentPage,
        size: 100,
      },
    });

    if (response.error) {
      throw response.error;
    }

    for (const order of response.data.data) {
      totalRevenue += order.attributes.total;
    }

    hasNextPage = !response.data.meta.page.lastPage;
    currentPage++;
  }

  // Revenue is in cents so we convert to dollars (or your main currency unit)
  return totalRevenue / 100;
}
