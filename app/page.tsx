import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Link,
  Image
} from "@nextui-org/react";
import axios from "axios";

export default async function Home() {
  let data = await axios
    .get(
      "https://arc.msn.com/v3/Delivery/Placement?pid=338387&fmt=json&cdm=1&pl=zh-CN&lc=zh-CN&ctry=CN"
    )
    .then((res) => {
      let resp = res.data.batchrsp.items[0].item;
      let data = JSON.parse(resp);
      return data;
    });

  const downloadImage = () => {
    const imageUrl = data['ad']['image_fullscreen_001_landscape']['u'];

    fetch(imageUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${data['ad']['title_text']['tx']}.jpg`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((error) => {
        console.error("Error downloading image:", error);
      });
  };
  
  return (
    <div className="relative h-screen flex items-center justify-center">
      <Image
        className="object-cover w-full h-full absolute inset-0"
        src={data['ad']['image_fullscreen_001_landscape']['u']}
      />
      <Card className="max-w-[400px] absolute bottom-4 right-4">
        <CardHeader className="flex gap-3">
          <div className="flex flex-col">
            <p className="text-md">{data['ad']['title_text']['tx']}</p>
            <p className="text-small text-default-500">{data['ad']['copyright_text']['tx']}</p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          <p>{data['ad']['hs1_title_text']['tx']}</p>
          <p className="text-small text-default-500">{data['ad']['hs1_cta_text']['tx']}</p>
        </CardBody>
        <Divider />
        <CardFooter>
          <Link
            isExternal
            showAnchorIcon
            href={data['ad']['hs2_destination_url']['u'].replace('microsoft-edge:', '')}
          >
            探索更多
          </Link>
          
        </CardFooter>
      </Card>
    </div>
  );
}
