const axios = require("axios");
const cheerio = require("cheerio");
const iconv = require("iconv-lite");
const userAgents = require("user-agents");

let numArticle = null;

const sendRequestGetDetail = async (URL) => {
  const randomUserAgent = new userAgents({
    deviceCategory: "desktop",
  }).toString();

  const response = await axios.request({
    method: "GET",
    url: URL,
    responseType: "arraybuffer",
    responseEncoding: "binary",
    headers: {
      "User-Agent": randomUserAgent,
    },
  });
  return iconv.decode(response.data, "utf-8");

  // return html;
};

const getAllAuthorURL = async (url) => {
  const html = await sendRequestGetDetail(url);
  return await getURL(html);
  // return allURL;
};

const getURL = async (html) => {
  const selector = "#gsc_sa_ccl > div.gsc_1usr";
  const $ = cheerio.load(html);
  const content = $(selector);
  const url_data = [];

  content.each(function () {
    const obj = {
      name: $(this).find("div > div > h3 > a").text(),
      url: "https://scholar.google.com" + $(this).find("div > a").attr("href"),
    };
    url_data.push(obj);
  });
  return url_data;
};

const getAuthorAllDetail = async (URL, author_id) => {
  const selector = "#gsc_a_b > tr";
  const html = await sendRequestGetDetail(URL);
  const content = await getArticleUrl(html, selector);
  const article_detail = [];

  //content.length
  console.log("Scraping Articles: ");
  for (let i = 0; i < 10; i++) {
    console.log(i + 1);
    const article_sub_data = content[i];
    const detail_page_url = article_sub_data.url;
    const detail_page_html = await sendRequestGetDetail(detail_page_url);
    numArticle += 1;
    const article_data = await getArticleDetail(
      detail_page_html,
      detail_page_url,
      author_id
    );
    article_detail.push(article_data);
  }
  const authorAllDetail = await getAuthorDetail(html, author_id, URL);
  authorAllDetail.articles = article_detail;

  return authorAllDetail;
};



const getArticleUrl = async (html, selector) => {
  const $ = cheerio.load(html);
  const content = $(selector);
  const news_data = [];
  content.each(function () {
    const obj = {
      title: $(this).find("td.gsc_a_t > a").text(),
      url: "https://scholar.google.com" + $(this).find("a").attr("href"),
    };
    news_data.push(obj);
  });
  return news_data;
};

const check_src_image = async (html) => {
  const $ = cheerio.load(html);
  let src;
  let image = $("#gsc_prf_pup-img").attr("src");
  if (image.indexOf("https://scholar.googleusercontent.com") == -1) {
    src = "https://scholar.googleusercontent.com" + image;
  } else {
    src = image;
  }
  return src;
};

const getAuthorDetail = async (html, num, url) => {
  const $ = cheerio.load(html);
  const userID = await getUserScholarId(url);
  const author_detail = {
    author_id: num,
    author_name: $("#gsc_prf_in").text(),
    department: $("#gsc_prf_i > div:nth-child(2)").text(),
    subject_area: await getSubjectArea(html),
    h_index: $(
      "#gsc_rsb_st > tbody > tr:nth-child(2) > td:nth-child(2)"
    ).text(),
    image: await check_src_image(html),
    citation_by: await getCitationByFromApi(userID),
  };
  

  return author_detail;
};

const getSubjectArea = async (html) => {
  const $ = cheerio.load(html);
  const subjectArea = [];
  const subject = $("#gsc_prf_int > a");

  for (let i = 0; i < subject.length; i++) {
    const obj = $("#gsc_prf_int > a:nth-child(" + (i + 1) + ")").text();
    subjectArea.push(obj);
  }

  return subjectArea;
};

const getUserScholarId = async (url) => {
  const regex = /user=([\w-]+)/;
  const match = url.match(regex);
  const user_scholar_id = match[1];
  return user_scholar_id;
};

const SerpApi = require("google-search-results-nodejs");
const search = new SerpApi.GoogleSearch(
  "5c609ed064ace1fca661d3ae20f2b72fe58ba00c129979a7d6f568c2069f10d6"
);

const getCitationByFromApi = async (user_scholar_id) => {
  const params = {
    engine: "google_scholar_author",
    author_id: user_scholar_id,
  };

  return new Promise((resolve, reject) => {
    search.json(
      params,
      function (data) {
        resolve(data["cited_by"]);
      },
      function (error) {
        reject(error);
      }
    );
  });
};

const getArticleDetail = async (html, url, author_id) => {
  const $ = cheerio.load(html);
  const content = $("#gsc_oci_table > div.gs_scl");

  const field = [];
  let article_data = {};
  (article_data.article_id = numArticle),
    (article_data.article_name = $("#gsc_oci_title > a").text());

  content.each(async function (i) {
    let fieldText = $(this).find(".gsc_oci_field").text().trim().toLowerCase();
    fieldText = fieldText.replace(" ", "_");
    const fieldValue = $(this).find(".gsc_oci_value > div > a").text().trim();
    field.push(fieldText);

    if (fieldText === "total_citations") {
      article_data[fieldText] = fieldValue.replace("Cited by", "").trim();
    } else {
      article_data[fieldText] = $(this).find(".gsc_oci_value").text().trim();
      if (fieldText === "authors") {
        article_data[fieldText] = await getAuthor(article_data[fieldText]);
      }
    }
  });
  (article_data.url = url), (article_data.author_id = author_id);

  return article_data;
};

const getAuthor = async (author) => {
  const author_data = author.split(",");
  for (let i = 0; i < author_data.length; i++) {
    author_data[i] = author_data[i].trim();
  }
  return author_data;
};

module.exports = {
  getAuthorAllDetail,
  getAllAuthorURL,
  sendRequestGetDetail,
  getAuthorDetail,
  getArticleDetail,
};
