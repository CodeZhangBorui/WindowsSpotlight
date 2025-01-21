"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Link,
  Skeleton
} from "@nextui-org/react";
import { Cookies } from "react-cookie";
import axios from "axios";

const Home = () => {
  const [spotlightData, setSpotlightData] = useState(null);
  const [showState, setShowState] = useState({"showCalendar": false, "showInfo": true});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "/winspotapi"
        );
        const resp = response.data.batchrsp.items[0].item;
        const parsedData = JSON.parse(resp);
        setSpotlightData(parsedData);
      } catch (error) {
        try {
          const response = await axios.get(
            "https://arc.msn.com/v3/Delivery/Placement?pid=338387&fmt=json&cdm=1&pl=zh-CN&lc=zh-CN&ctry=CN"
          );
          const resp = response.data.batchrsp.items[0].item;
          const parsedData = JSON.parse(resp);
          setSpotlightData(parsedData);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
    };
    
    const fetchSettings = async () => {
      const cookies = new Cookies();
      let showCalendar = cookies.get("showCalendar");
      let showInfo = cookies.get("showInfo");
      let preferences = {"showCalendar": showCalendar, "showInfo": showInfo};
      console.log(preferences);
      
      if (showCalendar === undefined) {
        preferences["showCalendar"] = false;
        cookies.set("showCalendar", false, { path: "/" });
      }
      if(showInfo === undefined) {
        preferences["showInfo"] = true;
        cookies.set("showInfo", true, { path: "/" });
      }

      setShowState(preferences);
    }

    // Only fetch data on the client side, not during server-side rendering
    if (typeof window !== "undefined") {
      fetchData();
      fetchSettings();
    }
  }, []);

  const downloadImage = () => {
    const imageUrl = spotlightData?.['ad']['image_fullscreen_001_landscape']['u'];

    if (imageUrl) {
      fetch(imageUrl)
        .then((res) => res.blob())
        .then((blob) => {
          const url = window.URL.createObjectURL(new Blob([blob]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `${spotlightData['ad']['title_text']['tx']}.jpg`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        })
        .catch((error) => {
          console.error("Error downloading image:", error);
        });
    }
  };

  return (
    <div className="relative h-screen flex items-center justify-center">
      {spotlightData && (
        <img
          className="object-cover w-full h-full absolute inset-0"
          src={spotlightData['ad']['image_fullscreen_001_landscape']['u']}
        />
      )}
      {spotlightData && showState["showInfo"] &&  (
        <Card className="max-w-[400px] absolute bottom-4 right-4">
          <CardHeader className="flex gap-3">
            <div className="flex flex-col">
              <p className="text-md">{spotlightData['ad']['title_text']['tx']}</p>
              <p className="text-small text-default-500">{spotlightData['ad']['copyright_text']['tx']}</p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody>
            <p>{spotlightData['ad']['hs1_title_text']['tx']}</p>
            <p className="text-small text-default-500">{spotlightData['ad']['hs1_cta_text']['tx']}</p>
          </CardBody>
          <Divider />
          <CardFooter>
            <Link
              isExternal
              showAnchorIcon
              href={String(spotlightData['ad']['hs2_destination_url']['u']).replace('microsoft-edge:', '')}
            >
              探索更多
            </Link>
            <Button onPress={downloadImage}>下载图片</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default Home;
