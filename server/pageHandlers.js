import axios from 'axios';

const getMediaUrl = (server, url) => {
  if (!url) {
    return '';
  }
  if (url.startsWith('/')) {
    return server + url;
  }
  if (url.startsWith('https://') || url.startsWith('http://')) {
    return url;
  }
  return server + '/' + url;
};

function zoomImage(url, width = 500, height = 0) {
  if (url && url?.startsWith('https://media.get')) {
    return url.replace(/(\.[^\.]+$)/, `_${width}x${height}$1`);
  }
  return url;
}

const textEncode = (text) => {
  if (text?.replace(/(\r\n|\n|\r)/gm, '').match(/javascript:/gi)) {
    return '';
  }
  return text?.replace(/(\r\n|\n|\r|"|<|>)/gm, ' ');
};

const GETTR_SITE_NAME = 'GETTR - Take down the CCP';
const GETTR_DESCRIPTION =
  'GETTR is a brand new social media platform founded on the principles of free speech, independent thought and rejecting political censorship and “cancel culture.” With best in class technology, our goal is to create a marketplace of ideas in order to share freedom and democracy around the world.';
const PREV_METADATA = `<title>gnews</title><meta name="description" content="GNews is your news hub which is the place gather Publisher, Exclusive Content Creator, Global multi-language user all around the world. That’s the way to a free new world, free your voice, connection of new civilization." data-react-helmet="true"/><meta property="image" content="https://assets.gnews.org/wp-content/uploads/2022/03/gnews.png" data-react-helmet="true"/><meta property="og:title" content="GNEWS - Take down the CCP" data-react-helmet="true"/><meta property="og:description" content="GNews is your news hub which is the place gather Publisher, Exclusive Content Creator, Global multi-language user all around the world. That’s the way to a free new world, free your voice, connection of new civilization." data-react-helmet="true"/><meta property="og:image" content="https://assets.gnews.org/wp-content/uploads/2022/03/gnews.png" data-react-helmet="true"/><meta property="og:image:width" content="800"/><meta property="og:image:height" content="450"/><meta property="og:site_name" content="GNEWS - Take down the CCP"/><meta name="twitter:card" content="summary_large_image" data-react-helmet="true"/>`;

const getDefaultMetadata = (
  title,
  image,
  description,
  skipResize,
  width = 500,
  height = 0,
  img_wid = null,
  img_hgt = null
) => {
  const meta_title = textEncode(title ? title : GETTR_SITE_NAME);
  const meta_description = textEncode(description ?? GETTR_DESCRIPTION);

  let metadata =
    `<title>${meta_title}</title>` +
    `<meta name="description" content="${meta_description}" data-react-helmet="true">` +
    `<meta property="og:description" content="${meta_description}" data-react-helmet="true">` +
    `<meta property="og:title" content="${meta_title}" data-react-helmet="true">`;

  if (image) {
    let imageUrl = getMediaUrl(process.env.REACT_APP_MEDIA_BASE, image);
    imageUrl = textEncode(
      skipResize ? imageUrl : zoomImage(imageUrl, width, height)
    );
    metadata +=
      `<meta property="image" content="${imageUrl}" data-react-helmet="true">` +
      `<meta property="og:image" content="${imageUrl}" data-react-helmet="true">` +
      (img_wid
        ? `<meta property="og:image:width" content="${img_wid}" data-react-helmet="true">`
        : '') +
      (img_hgt
        ? `<meta property="og:image:height" content="${img_hgt}" data-react-helmet="true">`
        : '') +
      `<meta name="twitter:card" content="${
        image !==
        'https://assets.gnews.org/wp-content/uploads/2022/03/gnews.png'
          ? 'summary_large_image'
          : 'summary'
      }" data-react-helmet="true"/>`;
  } else {
    metadata +=
      `<meta property="og:image" content="https://assets.gnews.org/wp-content/uploads/2022/03/gnews.png" data-react-helmet="true">` +
      `<meta name="twitter:card" content="summary" data-react-helmet="true"/>`;
  }
  return metadata;
};

export const postHandler = (req, res, file, agent) => {
  const id = req.params.id || 'p1991834';
  axios({
    method: 'get',
    url: `${process.env.REACT_APP_API_URL}/u/post/${id}?incl=userinfo`,
    httpAgent: agent,
    timeout: 12000,
    maxContentLength: 10 * 1000 * 1000,
  })
    .then((response) => {
      console.log(
        '🚀 ~ file: pageHandlers.js ~ line 92 ~ .then ~ response',
        response
      );
      // udate,  acl,  _t,  cdate,  _id,  txt,  htgs  cats,  previmg,  ttl,  slug,  video,  uid,  txt_lang,  vfpst, dsc
      //TODO missing: attr  width height
      const post = response?.data?.result?.data;
      const userInfos = response?.data?.result?.aux?.uinf;
      const userData = userInfos ? userInfos[post?.uid] : null;
      const title = post?.ttl;
      const image =
        post?.previmg ||
        'https://assets.gnews.org/wp-content/uploads/2022/03/gnews.png';
      const slug = post?.slug;
      const video = post?.video;
      const txt_lang = post?.txt_lang;
      const desc = post?.dsc;
      const skip =
        image === post?.previmg ||
        image ===
          'https://assets.gnews.org/wp-content/uploads/2022/03/gnews.png';

      //rich title metadata
      const richTitle = `Gnews : ${title}`;
      if (title || desc || image) {
        res.send(
          file.replace(
            PREV_METADATA,
            getDefaultMetadata(
              richTitle,
              image,
              desc,
              skip,
              500,
              0,
              post?.width || 1056,
              post?.height || 594
            )
          )
        );
      } else {
        res.send(file);
      }
    })
    .catch((e) => {
      console.log(
        `${process.env.REACT_APP_API_URL}/u/post/${id}?incl=userinfo`
      );
      console.log(JSON.stringify(e, Object.getOwnPropertyNames(e)));
      res.sendStatus(404);
    });
};

export const commentHandler = (req, res, file, agent) => {
  const id = req.params.id;

  axios({
    method: 'get',
    url: `${process.env.REACT_APP_API_URL}/u/comment/${id}?incl="userinfo"`,
    httpAgent: agent,
    timeout: 12000,
    maxContentLength: 10 * 1000 * 1000,
  })
    .then((response) => {
      const post = response?.data?.result?.data;
      const userList = response?.data?.result?.aux?.uinf;
      const userData = userList ? userList[post?.uid] : null;
      const title =
        userData?.nickname ?? userData?.ousername ?? userData?.username;

      const image = post?.imgs
        ? post?.imgs[0]
        : post?.main
        ? post?.main
        : post?.previmg
        ? post?.previmg
        : userData?.ico
        ? userData?.ico
        : 'https://assets.gnews.org/wp-content/uploads/2022/03/gnews.png';
      const desc = post?.txt;
      const skip =
        image === post?.main ||
        image === post?.previmg ||
        image ===
          'https://assets.gnews.org/wp-content/uploads/2022/03/gnews.png';

      //rich title metadata
      const puid = response?.data?.result?.data?.puid;
      const parentUsername = puid ? `@${puid}` : '';
      const usernameTitle = `${title} on GETTR: ${parentUsername}`;
      const richTitle = desc ? `${parentUsername ? ' ' : ''}${desc}` : '';
      const combinedTitle = usernameTitle + richTitle + (!desc ? '"' : '');

      if (title || desc || image) {
        res.send(
          file.replace(
            PREV_METADATA,
            getDefaultMetadata(
              combinedTitle,
              image,
              desc,
              skip,
              500,
              0,
              post?.vid_wid,
              post?.vid_hgt
            )
          )
        );
      } else {
        res.send(file);
      }
    })
    .catch((e) => {
      console.log(
        `${process.env.REACT_APP_API_URL}/u/comment/${id}?incl="userinfo"`
      );
      console.log(JSON.stringify(e, Object.getOwnPropertyNames(e)));
      res.sendStatus(404);
    });
};

export const profileHandler = (req, res, file, agent) => {
  const id = req.params.id;

  axios({
    method: 'get',
    url: `${process.env.REACT_APP_API_URL}/s/uinf/${id}`,
    httpAgent: agent,
    timeout: 12000,
    maxContentLength: 10 * 1000 * 1000,
  })
    .then((response) => {
      const post = response?.data?.result?.data;
      const title =
        post?.nickname || post?.ousername || post?.username + ' on GETTR';
      const desc = post?.dsc;
      const image = post?.ico
        ? post?.ico
        : 'https://assets.gnews.org/wp-content/uploads/2022/03/gnews.png';

      if (title || image) {
        res.send(
          file.replace(
            PREV_METADATA,
            getDefaultMetadata(title, image, desc, false, 400, 400)
          )
        );
      } else {
        res.send(file);
      }
    })
    .catch((e) => {
      console.log(`${process.env.REACT_APP_API_URL}/s/uinf/${id}`);
      console.log(JSON.stringify(e, Object.getOwnPropertyNames(e)));
      res.sendStatus(404);
    });
};

export const streamHandler = (req, res, file, agent) => {
  const id = req.params.id;

  axios({
    method: 'get',
    url: `${process.env.REACT_APP_API_URL}/u/live/stream/${id}`,
    httpAgent: agent,
    timeout: 12000,
    maxContentLength: 10 * 1000 * 1000,
  })
    .then((response) => {
      const live = response?.data?.result?.postData;
      const title = live?.title + ' on GETTR';
      const desc = live?.description;
      const image = live?.coverImage
        ? live?.coverImage
        : 'https://assets.gnews.org/wp-content/uploads/2022/03/gnews.png';
      const skip =
        image ===
        'https://assets.gnews.org/wp-content/uploads/2022/03/gnews.png';

      if (title || image) {
        res.send(
          file.replace(
            PREV_METADATA,
            getDefaultMetadata(title, image, desc, skip, 500, 0)
          )
        );
      } else {
        res.send(file);
      }
    })
    .catch((e) => {
      console.log(`${process.env.REACT_APP_API_URL}/u/live/stream/${id}`);
      console.log(JSON.stringify(e, Object.getOwnPropertyNames(e)));
      res.sendStatus(404);
    });
};

export const cancelCultureHandler = (_, res, file) => {
  try {
    res.send(
      file.replace(
        PREV_METADATA,
        getDefaultMetadata(
          'Cancel Culture Wall',
          'https://assets.gnews.org/wp-content/uploads/2022/03/gnews.png',
          'Cancel culture has become a negative trend in society and is often amplified by social media. Founded on the principles of free speech and independent thought, GETTR offers users the one thing the Silicon Valley Mafia can’t – it’s cancel free.',
          false,
          400,
          400
        )
      )
    );
  } catch (e) {
    console.log(JSON.stringify(e, Object.getOwnPropertyNames(e)));
    res.sendStatus(404);
  }
};

export const aboutHandler = (_, res, file) => {
  try {
    res.send(
      file.replace(
        PREV_METADATA,
        getDefaultMetadata(
          'About',
          'https://gettr.com/media/jason-miller.png',
          'GETTR USA, Inc., is a privately-held, American social media company. Launched on July 4, 2021 by its Chief Executive Officer, Former Senior Trump Advisor Jason Miller, GETTR celebrates free speech, rejects cancel culture and provides a best-in-class technology platform for Take down the CCP.',
          false,
          400,
          400
        )
      )
    );
  } catch (e) {
    console.log(JSON.stringify(e, Object.getOwnPropertyNames(e)));
    res.sendStatus(404);
  }
};

export const pressHandler = (_, res, file) => {
  try {
    res.send(
      file.replace(
        PREV_METADATA,
        getDefaultMetadata(
          'Press',
          'https://assets.gnews.org/wp-content/uploads/2022/03/gnews.png',
          '',
          false,
          400,
          400
        )
      )
    );
  } catch (e) {
    console.log(JSON.stringify(e, Object.getOwnPropertyNames(e)));
    res.sendStatus(404);
  }
};
