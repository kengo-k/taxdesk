export const getPageList = (
  page_no: number,
  all_count: number,
  page_size: number
) => {
  const page_range = 9;
  const page_count =
    all_count < page_size
      ? 1
      : Math.floor(all_count / page_size) +
        (all_count % page_size !== 0 ? 1 : 0);
  if (page_no <= 0) {
    page_no = 1;
  }
  if (page_no > page_count) {
    page_no = page_count;
  }
  let diff = 0;
  let pageList = [] as number[];
  if (page_count > page_range) {
    pageList.push(page_no);
    for (let i = page_no - 1; i >= page_no - 4; i--) {
      if (i >= 1) {
        pageList.unshift(i);
      } else {
        diff = 1;
        break;
      }
    }
    for (let i = page_no + 1; i <= page_no + 4; i++) {
      if (i <= page_count) {
        pageList.push(i);
      } else {
        diff = -1;
        break;
      }
    }
    if (diff === 1) {
      const adjustSize = 9 - pageList.length;
      const last = pageList[pageList.length - 1];
      for (let i = 1; i <= adjustSize; i++) {
        pageList.push(last + i);
      }
    }
    if (diff === -1) {
      const adjustSize = 9 - pageList.length;
      const first = pageList[0];
      const pre = [];
      for (let i = 1; i <= adjustSize; i++) {
        pre.unshift(first - i);
      }
      pageList = [...pre, ...pageList];
    }
  } else {
    for (let i = 1; i <= page_count; i++) {
      pageList.push(i);
    }
  }
  const from = (page_no - 1) * page_size + 1;
  const to =
    page_no === page_count
      ? all_count
      : page_no * page_size > all_count
      ? all_count
      : page_no * page_size;

  return {
    pageCount: page_count,
    pageList,
    from: all_count > 0 ? from : 0,
    to: all_count > 0 ? to : 0,
  };
};
