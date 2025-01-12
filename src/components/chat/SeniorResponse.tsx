import React, { useEffect } from 'react';
import { FaLink } from 'react-icons/fa6';
import { MdOutlineEmail } from 'react-icons/md';
import { FaPhoneVolume } from 'react-icons/fa6';
import { IoIosArrowForward } from 'react-icons/io';

import { seniorFaqs } from '../../types/faq';
import SeniorHobitProfile from './SeniorHobitProfile';

interface SeniorResponseProps {
  seniorFaqId: number;
}

const SeniorResponse: React.FC<SeniorResponseProps> = ({ seniorFaqId }) => {
  const matchedFaq = seniorFaqs.find(
    (faq) => faq.senior_faq_id === seniorFaqId
  );

  // Ensure Kakao Map SDK is loaded only once
  const loadKakaoMapSDK = async () => {
    if (document.querySelector('script[src*="dapi.kakao.com"]')) {
      return; // SDK already loaded
    }
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=2efd555ee1d8091a8fb33477f8c771cb&autoload=false`;
    script.async = true;
    document.body.appendChild(script);

    return new Promise<void>((resolve, reject) => {
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Kakao Map SDK'));
    });
  };

  const renderMap = (latitude: number, longitude: number, mapId: string) => {
    if (window.kakao && window.kakao.maps) {
      const mapContainer = document.getElementById(mapId);
      if (mapContainer) {
        const mapOption = {
          center: new window.kakao.maps.LatLng(latitude, longitude),
          level: 3,
        };
        const map = new window.kakao.maps.Map(mapContainer, mapOption);

        const marker = new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(latitude, longitude),
        });
        marker.setMap(map);
      }
    }
  };

  useEffect(() => {
    const initializeMaps = async () => {
      try {
        await loadKakaoMapSDK();
        window.kakao.maps.load(() => {
          matchedFaq?.answer_ko.forEach((answer, index) => {
            const latitude = parseFloat(answer.map?.latitude || '37.566535'); // Default: 광화문
            const longitude = parseFloat(answer.map?.longitude || '126.977969'); // Default: 광화문
            const mapId = `map-${seniorFaqId}-${index}`; // Unique map ID per FAQ and index
            renderMap(latitude, longitude, mapId);
          });
        });
      } catch (error) {
        console.error('Failed to initialize Kakao Maps:', error);
      }
    };

    initializeMaps();
  }, [matchedFaq, seniorFaqId]);

  if (!matchedFaq) {
    return (
      <div>
        <SeniorHobitProfile />
        <p>No matching FAQ found for ID: {seniorFaqId}</p>
        <div
          id={`map-placeholder-${seniorFaqId}`}
          style={{ width: '100%', height: '400px', marginTop: '20px' }}
        ></div>
      </div>
    );
  }

  return (
    <div>
      <SeniorHobitProfile />
      <div className="flex flex-row flex-wrap">
        {matchedFaq.answer_ko.map((answer, index) => {
          const latitude = parseFloat(answer.map?.latitude || '37.566535');
          const longitude = parseFloat(answer.map?.longitude || '126.977969');
          const mapId = `map-${seniorFaqId}-${index}`; // Unique map ID

          return (
            <div
              key={index}
              className="font-5medium text-[20px] bg-[#FFEFEF] mt-[10px] rounded-[20px] px-[20px] py-[15px] w-[365px] break-words inline-block mr-[10px]"
            >
              {index === 0 && (
                <div className="flex flex-row text-[16px] text-[#686D76] items-center rounded-[10px] w-fit mb-[10px]">
                  <h3 className="font-5medium">{matchedFaq.maincategory_ko}</h3>
                  <IoIosArrowForward />
                  <h3 className="font-4regular">{matchedFaq.subcategory_ko}</h3>
                  <IoIosArrowForward />
                  <h3 className="font-4regular">
                    {matchedFaq.detailcategory_ko}
                  </h3>
                </div>
              )}
              <div
                id={mapId}
                style={{ width: '100%', height: '300px', marginTop: '20px' }}
              ></div>
              {(answer.url || answer.email || answer.phone) && (
                <div className="w-full h-[1px] bg-gray-300 mt-[20px]" />
              )}
              {answer.url && (
                <div className="flex flex-row items-center mt-[20px]">
                  <FaLink className="mr-[10px] text-[36px] text-[#686D76] bg-white p-[8px] rounded-full" />
                  <a
                    href={
                      answer.url.startsWith('http')
                        ? answer.url
                        : `http://${answer.url}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[18px] text-[#0A5EB0] cursor-pointer hover:underline"
                  >
                    {answer.url}
                  </a>
                </div>
              )}
              {answer.email && (
                <div className="flex flex-row items-center mt-[10px]">
                  <MdOutlineEmail className="mr-[10px] text-[36px] text-[#686D76] bg-white p-[8px] rounded-full" />
                  <p className="text-[18px]">{answer.email}</p>
                </div>
              )}
              {answer.phone && (
                <div className="flex flex-row items-center mt-[10px]">
                  <FaPhoneVolume className="mr-[10px] text-[36px] text-[#686D76] bg-white p-[8px] rounded-full" />
                  <p className="text-[18px]">{answer.phone}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SeniorResponse;
