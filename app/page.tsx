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
  Skeleton,
} from "@nextui-org/react";
import { Cookies } from "react-cookie";
import axios from "axios";

const { Solar, Lunar } = require("lunar-javascript");

const Home = () => {
  const [spotlightData, setSpotlightData] = useState(null);
  const [showState, setShowState] = useState({
    showCalendar: false,
    showInfo: true,
  });
  const [calendarData, setCalendarData] = useState({
    year: 0,
    month: 0,
    day: 0,
    hour: 0,
    minute: 0,
    weekday: "一",
    lunar_month: "正月",
    lunar_day: "初一",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/winspotapi");
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
      let preferences = { showCalendar: showCalendar, showInfo: showInfo };
      console.log(preferences);

      if (showCalendar === undefined) {
        preferences["showCalendar"] = false;
        cookies.set("showCalendar", false, { path: "/" });
      }
      if (showInfo === undefined) {
        preferences["showInfo"] = true;
        cookies.set("showInfo", true, { path: "/" });
      }

      setShowState(preferences);
    };

    const refreshCalendar = () => {
      let date = new Date();
      let year = date.getFullYear();
      let month = date.getMonth() + 1;
      let day = date.getDate();
      let hour = date.getHours();
      let minute = date.getMinutes();
      let solar = Solar.fromDate(date);
      let weekday = solar.getWeekInChinese();
      let lunar = solar.getLunar();
      let lunar_month = lunar.getMonthInChinese();
      let lunar_day = lunar.getDayInChinese();
      setCalendarData({
        year: year,
        month: month,
        day: day,
        hour: hour,
        minute: minute,
        weekday: weekday,
        lunar_month: lunar_month,
        lunar_day: lunar_day,
      });
      // console.log(`${year}年${month}月${day}日 ${hour}:${minute} 星期${weekday} 农历${lunar_month}${lunar_day}`);
    };

    // Only fetch data on the client side, not during server-side rendering
    if (typeof window !== "undefined") {
      fetchData();
      fetchSettings();
      refreshCalendar();
    }
    const intervalId = setInterval(() => {
      refreshCalendar();
    }, 500);
    return () => clearInterval(intervalId);
  }, []);

  const downloadImage = () => {
    const imageUrl =
      spotlightData?.["ad"]["image_fullscreen_001_landscape"]["u"];

    if (imageUrl) {
      fetch(imageUrl)
        .then((res) => res.blob())
        .then((blob) => {
          const url = window.URL.createObjectURL(new Blob([blob]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute(
            "download",
            `${spotlightData["ad"]["title_text"]["tx"]}.jpg`
          );
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
      {showState["showCalendar"] && calendarData["year"] != 0 && (
        <div
          className="absolute top-0 left-1/2 transform -translate-x-1/2 text-white text-center z-10 mt-[15%] space-y-2"
          style={{ textShadow: "2px 2px 4px #000" }}
        >
          <div className="text-5xl font-bold">
            {String(calendarData.hour).padStart(2, "0")}:
            {String(calendarData.minute).padStart(2, "0")}
          </div>
          <div>
            {calendarData.year}-{calendarData.month}-{calendarData.day}
          </div>
          <div>
            {calendarData.lunar_month}月{calendarData.lunar_day}
          </div>
        </div>
      )}
      {spotlightData && (
        <img
          className="object-cover w-full h-full absolute inset-0 z-0"
          src={spotlightData["ad"]["image_fullscreen_001_landscape"]["u"]}
        />
      )}
      {spotlightData && showState["showInfo"] && (
        <Card className="max-w-[400px] absolute bottom-4 right-4">
          <CardHeader className="flex gap-3">
            <div className="flex flex-col">
              <p className="text-md">
                {spotlightData["ad"]["title_text"]["tx"]}
              </p>
              <p className="text-small text-default-500">
                {spotlightData["ad"]["copyright_text"]["tx"]}
              </p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody>
            <p>{spotlightData["ad"]["hs1_title_text"]["tx"]}</p>
            <p className="text-small text-default-500">
              {spotlightData["ad"]["hs1_cta_text"]["tx"]}
            </p>
          </CardBody>
          <Divider />
          <CardFooter>
            <Link
              isExternal
              showAnchorIcon
              href={String(
                spotlightData["ad"]["hs2_destination_url"]["u"]
              ).replace("microsoft-edge:", "")}
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
