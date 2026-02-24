/**
 * 解析列表中每项的 banner_content JSON 字符串并转换为对象
 * @param {Array} bannerList - 包含 banner_content 字段的对象列表
 * @returns {Array} - 解析后的列表，banner_content 字段已转换为对象
 */
function parseBannerContent(bannerList) {
  if (!Array.isArray(bannerList)) {
    console.error('输入必须是数组');
    return bannerList;
  }

  return bannerList.map((item, index) => {
    try {
      // 检查是否存在 banner_content 字段
      if (!item.banner_content) {
        console.warn(`项目 ${index} 缺少 banner_content 字段`);
        return item;
      }

      // 解析 JSON 字符串
      const parsedContent = JSON.parse(item.banner_content);
      
      // 返回新对象，保持其他字段不变，只替换 banner_content
      return {
        ...item,
        banner_content: parsedContent
      };
    } catch (error) {
      console.error(`解析项目 ${index} 的 banner_content 失败:`, error);
      // 如果解析失败，返回原始项目
      return item;
    }
  });
}

// 示例使用
const exampleBanners = [
  {
    id: 1,
    title: "Banner 1",
    banner_content: '{"title":"Welcome Bonus","amount":100,"type":"deposit"}'
  },
  {
    id: 2,
    title: "Banner 2", 
    banner_content: '{"title":"Free Spins","spins":50,"game":"starburst"}'
  },
  {
    id: 3,
    title: "Banner 3",
    banner_content: '{"title":"Cashback","percentage":10,"max_amount":500}'
  }
];

// 解析示例数据
const parsedBanners = parseBannerContent(exampleBanners);

console.log('原始数据:');
console.log(JSON.stringify(exampleBanners, null, 2));

console.log('\n解析后数据:');
console.log(JSON.stringify(parsedBanners, null, 2));

// 导出函数供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { parseBannerContent };
}
