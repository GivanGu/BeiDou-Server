package org.gms.model.dto;

import lombok.*;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChrOnlineListRtnDTO {
    private int world;
    private int id;
    private String name;
    private int map;
    private int job;
    private String jobName;
    private int level;
    private int gm;
    private String accountName;   // 账户名
    private String loginIp;       // 登录IP
    private String hwid;          // 硬件ID
    private long meso;            // 金币
}
